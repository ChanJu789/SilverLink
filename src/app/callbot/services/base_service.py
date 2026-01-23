from typing import Any, Protocol

class RepositoryProtocol(Protocol):
    def read_by_options(self, schema: Any) -> Any: ...

class BaseService:
    def __init__(self, repository: RepositoryProtocol) -> None:
        self._repository = repository
    # def get_list(self, schema: Any) -> Any:
    #     return self._repository.read_by_options(schema)