from pydantic import Field, BaseModel

class ActionCreate(BaseModel):
    bot_id: str 
    name: str = Field(..., min_length=3, max_length=50)
    description: str = Field(min_length=20, max_length=500)
    base_uri: str = Field(None, max_length=200)
    payload: dict = Field({})
    status: str = Field("live", max_length=100)