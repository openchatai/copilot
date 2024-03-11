from routes.uploads.celery_service import celery


def add_new_user_to_email_contacts(email: str, user_id: str):
    celery.send_task(
        "workers.tasks.notification_job.add_new_user_to_email_contacts",
        args=[email, user_id],
    )


def send_copilot_created_follow_up_email(email: str):
    celery.send_task(
        "workers.tasks.notification_job.send_copilot_created_follow_up_email",
        args=["email"],
    )


def send_slack_notification(message):
    celery.send_task(
        "workers.tasks.notification_job.send_slack_notification", args=[message]
    )


def send_slack_heart_beat():
    celery.send_task(
        "workers.tasks.notification_job.slack_heart_beat", args=[]
    )
    
    
def send_slack_vote(is_upvote: bool, message: str):
    celery.send_task(
        "workers.tasks.notification_job.send_vote_notification", args=[is_upvote, message]
    )