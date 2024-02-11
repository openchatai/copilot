from sqlalchemy.orm import Session

from shared.models.opencopilot_db.api_call import APICall


class APICallRepository:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def log_api_call(
        self,
        url: str,
        path: str,
        method: str,
        path_params: str = "",
        query_params: str = "",
    ):
        api_call = APICall(
            url=url,
            path=path,
            method=method,
            path_params=path_params,
            query_params=query_params,
        )
        self.db_session.add(api_call)
        self.db_session.commit()
