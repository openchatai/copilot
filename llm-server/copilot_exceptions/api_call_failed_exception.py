class APICallFailedException(Exception):
    """Custom exception for API call failures."""

    def __init__(self, message="API call failed"):
        self.message = message
        super().__init__(self.message)
