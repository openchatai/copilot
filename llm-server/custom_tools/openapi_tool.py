from typing import Optional, Union
from math import sqrt, cos, sin
from langchain.tools import BaseTool

desc = (
    "use this tool when you need to calculate the length of a hypotenuse"
    "given one or two sides of a triangle and/or an angle (in degrees). "
    "To use the tool, you must provide at least two of the following parameters"
    "['adjacent_side', 'opposite_side', 'angle']."
)


class PythagorasTool(BaseTool):
    name = "Hypotenuse calculator"
    description = desc

    def _run(
        self,
        adjacent_side: Optional[Union[int, float]] = None,
        opposite_side: Optional[Union[int, float]] = None,
        angle: Optional[Union[int, float]] = None,
    ):
        # check for the values we have been given
        if adjacent_side and opposite_side:
            return sqrt(float(adjacent_side) ** 2 + float(opposite_side) ** 2)
        elif adjacent_side and angle:
            return adjacent_side / cos(float(angle))
        elif opposite_side and angle:
            return opposite_side / sin(float(angle))
        else:
            return "Could not calculate the hypotenuse of the triangle. Need two or more of `adjacent_side`, `opposite_side`, or `angle`."

    def _arun(self, query: str):
        raise NotImplementedError("This tool does not support async")


tools = [PythagorasTool()]
