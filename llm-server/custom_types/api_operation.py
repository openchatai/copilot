class ActionOperation_vs:
    def __init__(self, api_data):
        self.api_endpoint = api_data.get("api_endpoint", "")
        self.bot_id = api_data.get("bot_id", "")
        self.description = api_data.get("description", "")
        self.name = api_data.get("name", "")
        self.payload = api_data.get("payload", {})
        self.request_type = api_data.get("request_type", "")
        self.status = api_data.get("status", "")

    def __str__(self):
        payload_str = self.dict_to_str(self.payload)
        return (
            f"ApiOperation_vs(\n"
            f"  api_endpoint={self.api_endpoint},\n"
            f"  bot_id={self.bot_id},\n"
            f"  description={self.description},\n"
            f"  name={self.name},\n"
            f"  payload={payload_str},\n"
            f"  request_type={self.request_type},\n"
            f"  status={self.status}\n)"
        )

    @staticmethod
    def dict_to_str(d):
        if isinstance(d, dict):
            return "{" + ", ".join(f"{k}: {v}" for k, v in d.items()) + "}"
        elif isinstance(d, list):
            return "[" + ", ".join(ActionOperation_vs.dict_to_str(item) for item in d) + "]"
        else:
            return str(d)