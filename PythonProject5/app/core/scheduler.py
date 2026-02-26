from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)

# Single instance of the background scheduler
scheduler = BackgroundScheduler()

logger.info("[CORE] Background scheduler instance created")
