from shared.models.opencopilot_db.pdf_data_source_model import PdfDataSource


class PdfDataSourceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def insert_pdf_data_source(
        self, chatbot_id: str, file_name: str, status: str
    ):
        async with session_manager(self.session) as session:
            pdf_data_source = PdfDataSource(
                chatbot_id=chatbot_id, file_name=file_name, status=status
            )
            session.add(pdf_data_source)
            await session.commit()

    async def update_pdf_data_source_status(
        self, chatbot_id: str, file_name: str, status: str
    ):
        async with session_manager(self.session) as session:
            pdf_data_source = (
                await session.query(PdfDataSource)
                .filter_by(chatbot_id=chatbot_id, file_name=file_name)
                .first()
            )
            if pdf_data_source is None:
                raise ValueError(
                    "PDF data source with chatbot ID {} and file name {} does not exist".format(
                        chatbot_id, file_name
                    )
                )

            pdf_data_source.status = status
            await session.commit()

    async def query_all_pdf_data_sources(
        self,
    ):
        async with session_manager(self.session) as session:
            return await session.query(PdfDataSource).all()
