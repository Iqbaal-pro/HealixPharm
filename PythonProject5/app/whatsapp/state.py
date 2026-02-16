from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class UserState_wb:
    """
    Track user state in conversation
    Used to maintain context across messages
    """

    # Store user states in memory (replace with DB for production)
    _user_states: Dict[str, Dict] = {}

    @classmethod
    def get_user_state(cls, user_id: str) -> Dict:
        """
        Get current state for user
        """
        if user_id not in cls._user_states:
            logger.info(f"[WB_STATE] Creating new state for user {user_id}")
            cls._user_states[user_id] = {
                "current_step": "main_menu",
                "conversation_data": {},
                "last_action": None
            }
        logger.debug(f"[WB_STATE] Retrieved state for user {user_id}: {cls._user_states[user_id]['current_step']}")
        return cls._user_states[user_id]

    @classmethod
    def set_user_state(cls, user_id: str, step: str, data: Dict = None):
        """
        Update user state
        """
        if user_id not in cls._user_states:
            cls._user_states[user_id] = {}

        old_step = cls._user_states[user_id].get("current_step", "unknown")
        cls._user_states[user_id]["current_step"] = step

        if data:
            cls._user_states[user_id]["conversation_data"].update(data)

        logger.info(f"[WB_STATE] User {user_id} transitioned: {old_step} -> {step} | Data: {data}")

    @classmethod
    def set_last_action(cls, user_id: str, action: str):
        """
        Track last action for debugging
        """
        state = cls.get_user_state(user_id)
        state["last_action"] = action
        logger.debug(f"[WB_STATE] User {user_id} last action: {action}")

    @classmethod
    def clear_user_state(cls, user_id: str):
        """
        Clear user state (logout/reset)
        """
        if user_id in cls._user_states:
            logger.info(f"[WB_STATE] Cleared state for user {user_id}")
            del cls._user_states[user_id]

    @classmethod
    def get_all_states(cls) -> Dict:
        """
        Get all user states (debugging)
        """
        logger.debug(f"[WB_STATE] Total active users: {len(cls._user_states)}")
        return cls._user_states
