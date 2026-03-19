import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

# Single engine for the external Stock Management MySQL DB
stock_engine = create_engine(settings.STOCK_DATABASE_URL)
StockSession = sessionmaker(bind=stock_engine)

class StockIntegrationService:
    """
    Bridge service to interact with the external Stock Management MySQL DB.
    """

    def search_medicine(self, query: str):
        """
        Search for medicines by name in the Stock DB.
        """
        db = StockSession()
        try:
            sql = text("SELECT id, name, selling_price, unit_of_measurement FROM medicines WHERE name LIKE :query AND is_active = 1")
            result = db.execute(sql, {"query": f"%{query}%"})
            return [dict(row._mapping) for row in result]
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Search failed: {e}")
            return []
        finally:
            db.close()

    def get_medicine_details(self, medicine_id: int):
        """
        Get details for a specific medicine.
        """
        db = StockSession()
        try:
            sql = text("SELECT id, name, selling_price FROM medicines WHERE id = :id")
            result = db.execute(sql, {"id": medicine_id}).first()
            return dict(result._mapping) if result else None
        finally:
            db.close()

    def reserve_stock(self, medicine_id: int, quantity: int):
        """
        Increment the reserved quantity for a medicine.
        Uses the first matching inventory record for simplicity in this bridge.
        """
        db = StockSession()
        try:
            # We target the inventory table which has the quantity_reserved field
            sql = text("""
                UPDATE inventory 
                SET quantity_reserved = quantity_reserved + :qty 
                WHERE medicine_id = :mid 
                LIMIT 1
            """)
            db.execute(sql, {"qty": quantity, "mid": medicine_id})
            db.commit()
            logger.info(f"[STOCK_BRIDGE] Reserved {quantity} units for med_id {medicine_id}")
            return True
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Reservation failed: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    def release_stock(self, medicine_id: int, quantity: int):
        """
        Decrement the reserved quantity (used on cancellation).
        """
        db = StockSession()
        try:
            sql = text("""
                UPDATE inventory 
                SET quantity_reserved = GREATEST(0, quantity_reserved - :qty) 
                WHERE medicine_id = :mid 
                LIMIT 1
            """)
            db.execute(sql, {"qty": quantity, "mid": medicine_id})
            db.commit()
            logger.info(f"[STOCK_BRIDGE] Released {quantity} units for med_id {medicine_id}")
            return True
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Release failed: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    def check_stock_availability(self, medicine_id: int, quantity: int) -> dict:
        """
        Check if enough stock is available for a medicine.
        Available = quantity_available - quantity_reserved
        """
        db = StockSession()
        try:
            sql = text("""
                SELECT quantity_available, quantity_reserved,
                       (quantity_available - quantity_reserved) AS available
                FROM inventory
                WHERE medicine_id = :mid
                LIMIT 1
            """)
            row = db.execute(sql, {"mid": medicine_id}).first()
            if not row:
                return {"available": 0, "sufficient": False, "message": "No inventory record found"}
            mapping = row._mapping
            available = mapping["available"]
            return {
                "quantity_available": mapping["quantity_available"],
                "quantity_reserved": mapping["quantity_reserved"],
                "available": available,
                "requested": quantity,
                "sufficient": available >= quantity,
            }
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Availability check failed: {e}")
            return {"available": 0, "sufficient": False, "message": str(e)}
        finally:
            db.close()

    def get_available_stock(self, medicine_id: int) -> dict:
        """
        Get full stock info for a medicine including name and pricing.
        """
        db = StockSession()
        try:
            sql = text("""
                SELECT m.id, m.name, m.selling_price, m.cost_price,
                       m.unit_of_measurement, m.is_active,
                       COALESCE(i.quantity_available, 0) AS quantity_available,
                       COALESCE(i.quantity_reserved, 0) AS quantity_reserved,
                       COALESCE(i.quantity_damaged, 0) AS quantity_damaged,
                       COALESCE(i.quantity_available - i.quantity_reserved, 0) AS net_available
                FROM medicines m
                LEFT JOIN inventory i ON m.id = i.medicine_id
                WHERE m.id = :mid
            """)
            row = db.execute(sql, {"mid": medicine_id}).first()
            if not row:
                return None
            return dict(row._mapping)
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Get stock failed: {e}")
            return None
        finally:
            db.close()

    def deduct_stock(self, medicine_id: int, quantity: int):
        """
        Finalize stock deduction when order is fulfilled/delivered.
        Decreases quantity_available and clears the reserved amount.
        """
        db = StockSession()
        try:
            sql = text("""
                UPDATE inventory 
                SET quantity_available = GREATEST(0, quantity_available - :qty),
                    quantity_reserved = GREATEST(0, quantity_reserved - :qty),
                    last_dispensed_at = NOW(),
                    last_stock_update = NOW()
                WHERE medicine_id = :mid 
                LIMIT 1
            """)
            db.execute(sql, {"qty": quantity, "mid": medicine_id})
            db.commit()
            logger.info(f"[STOCK_BRIDGE] Deducted {quantity} units for med_id {medicine_id}")
            return True
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Deduction failed: {e}")
            db.rollback()
            return False
        finally:
            db.close()
            
                
    def get_channelling_service_charge(self) -> float:
        """
        Fetch channelling-specific service charge from pharmacy registration.
        Falls back to general service_charge if not set.
        """
        db = StockSession()
        try:
            sql = text("SELECT channelling_service_charge, service_charge FROM pharmacies LIMIT 1")
            row = db.execute(sql).first()
            if row:
                val = row._mapping.get("channelling_service_charge")
                if val is not None and val > 0:
                    return float(val)
                # fallback to general service charge
                fallback = row._mapping.get("service_charge")
                if fallback:
                    return float(fallback)
            return 0.0
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Failed to fetch channelling service charge: {e}")
            return 0.0
        finally:
            db.close()

    def set_channelling_service_charge(self, amount: float) -> bool:
        """
        Update the channelling service charge for the pharmacy.
        """
        db = StockSession()
        try:
            sql = text("UPDATE pharmacies SET channelling_service_charge = :amount LIMIT 1")
            db.execute(sql, {"amount": amount})
            db.commit()
            return True
        except Exception as e:
            logger.error(f"[STOCK_BRIDGE] Failed to update channelling service charge: {e}")
            db.rollback()
            return False
        finally:
            db.close()
