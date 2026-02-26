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
