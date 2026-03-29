from typing import Dict, Optional
import logging
from app.db import SessionLocal
from app.models import UserState

logger = logging.getLogger(__name__)


class UserState_wb:
    """
    Track user state in conversation
    Used to maintain context across messages, backed by database
    """

    @classmethod
    def get_user_state(cls, user_id: str) -> Dict:
        """
        Get current state for user from DB
        """
        db = SessionLocal()
        try:
            state_record = db.query(UserState).filter(UserState.user_id == user_id).first()
            if not state_record:
                logger.info(f"[WB_STATE] Creating new state in DB for user {user_id}")
                state_record = UserState(
                    user_id=user_id,
                    current_step="main_menu",
                    conversation_data={},
                    last_action=None,
                    is_first_message=True
                )
                db.add(state_record)
                db.commit()
                db.refresh(state_record)
            
            logger.debug(f"[WB_STATE] Retrieved state for user {user_id}: {state_record.current_step}")
            return {
                "current_step": state_record.current_step,
                "conversation_data": state_record.conversation_data or {},
                "last_action": state_record.last_action,
                "is_first_message": state_record.is_first_message
            }
        except Exception as e:
            logger.error(f"[WB_STATE] Error getting state for {user_id}: {e}")
            return {
                "current_step": "main_menu",
                "conversation_data": {},
                "last_action": None,
                "is_first_message": True
            }
        finally:
            db.close()

    @classmethod
    def set_user_state(cls, user_id: str, step: str, data: Dict = None):
        """
        Update user state in DB
        data: can contain both conversation_data updates and top-level state updates
        """
        db = SessionLocal()
        try:
            state_record = db.query(UserState).filter(UserState.user_id == user_id).first()
            if not state_record:
                state_record = UserState(
                    user_id=user_id,
                    current_step="unknown",
                    conversation_data={},
                    is_first_message=True
                )
                db.add(state_record)
                db.commit()

            old_step = state_record.current_step
            state_record.current_step = step

            if data:
                # Handle special top-level state properties
                if "is_first_message" in data:
                    state_record.is_first_message = data["is_first_message"]
                
                # Update conversation_data with remaining data
                remaining_data = {k: v for k, v in data.items() if k != "is_first_message"}
                if remaining_data:
                    current_conv_data = dict(state_record.conversation_data or {})
                    current_conv_data.update(remaining_data)
                    state_record.conversation_data = current_conv_data

            db.commit()
            logger.info(f"[WB_STATE] User {user_id} transitioned: {old_step} -> {step} | Data: {data}")
        except Exception as e:
            logger.error(f"[WB_STATE] Error setting state for {user_id}: {e}")
        finally:
            db.close()

    @classmethod
    def set_last_action(cls, user_id: str, action: str):
        """
        Track last action for debugging
        """
        # Ensure they exist first
        cls.get_user_state(user_id)

        db = SessionLocal()
        try:
            state_record = db.query(UserState).filter(UserState.user_id == user_id).first()
            if state_record:
                state_record.last_action = action
                db.commit()
                logger.debug(f"[WB_STATE] User {user_id} last action: {action}")
        except Exception as e:
            logger.error(f"[WB_STATE] Error setting last action for {user_id}: {e}")
        finally:
            db.close()

    @classmethod
    def clear_user_state(cls, user_id: str):
        """
        Clear user state (logout/reset)
        """
        db = SessionLocal()
        try:
            state_record = db.query(UserState).filter(UserState.user_id == user_id).first()
            if state_record:
                db.delete(state_record)
                db.commit()
                logger.info(f"[WB_STATE] Cleared state for user {user_id}")
        except Exception as e:
            logger.error(f"[WB_STATE] Error clearing state for {user_id}: {e}")
        finally:
            db.close()

    @classmethod
    def get_all_states(cls) -> Dict:
        """
        Get all user states (debugging)
        """
        db = SessionLocal()
        try:
            states = db.query(UserState).all()
            logger.debug(f"[WB_STATE] Total active users in DB: {len(states)}")
            return {
                s.user_id: {
                    "current_step": s.current_step,
                    "conversation_data": s.conversation_data,
                    "last_action": s.last_action,
                    "is_first_message": s.is_first_message
                }
                for s in states
            }
        except Exception as e:
            logger.error(f"[WB_STATE] Error getting all states: {e}")
            return {}
        finally:
            db.close()

