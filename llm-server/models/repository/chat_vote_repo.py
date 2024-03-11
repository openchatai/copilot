from shared.models.opencopilot_db import ChatVote, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound

Session = sessionmaker(bind=engine)


def upvote_or_down_vote_message(
    chatbot_id: str,
    message_id: str,
    is_upvote: bool,
) -> ChatVote:
    """Creates or updates a chat vote record.

    Args:
      chatbot_id: The ID of the chatbot that sent the message.
      message_id: The ID of the message.
      user_id: The ID of the user who is voting.
      is_upvote: True if the vote is an upvote, False if it's a downvote.

    Returns:
      The newly created or updated ChatVote object.
    """

    with Session() as session:
        try:
            chat_vote = (
                session.query(ChatVote)
                .filter_by(chatbot_id=chatbot_id, message_id=message_id)
                .one()
            )
            chat_vote.is_upvote = is_upvote
        except NoResultFound:
            chat_vote = ChatVote(
                chatbot_id=chatbot_id,
                message_id=message_id,
                is_upvote=is_upvote,
            )
            session.add(chat_vote)

        session.commit()
        session.refresh(chat_vote)
    return chat_vote