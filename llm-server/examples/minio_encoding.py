import base64
# from dotenv import load_dotenv


# load_dotenv()
access_key = "Olw9PacGWKI1fgxxkrzc"
secret_key = "QIvuZM3wBiKoHZxKtnocJaYgEI50M4qT1ndXzIdR"
authorization_header = base64.b64encode(f"{access_key}:{secret_key}".encode()).decode()

print(authorization_header)
