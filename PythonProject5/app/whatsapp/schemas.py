from pydantic import BaseModel
from typing import Optional, Dict, Any

class TextMessage_wb(BaseModel):
    """
    Incoming text message from user
    """
    from_number: str
    body: str

class InteractiveMessage_wb(BaseModel):
    """
    Incoming interactive button/list reply from user
    """
    from_number: str
    from pydantic import BaseModel
    from typing import Optional, Dict, Any


    class TextMessage_wb(BaseModel):
        """
        Incoming text message from user
        """
        from_number: str
        body: str


    class InteractiveMessage_wb(BaseModel):
        """
        Incoming interactive button/list reply from user
        """
        from_number: str
        button_id: str
        button_title: Optional[str] = None


    class WebhookMessage_wb(BaseModel):
        """
        Full webhook message structure from Meta
        """
        entry: list
        object: str


    class MenuButton_wb(BaseModel):
        """
        Button in interactive menu
        """
        id: str
        title: str


    class MenuItem_wb(BaseModel):
        """
        List item in interactive menu
        """
        id: str
        title: str
        description: Optional[str] = None
