import twophase.solver as sv
import sys

def solve(cube):
    return sv.solve(cube, 0, 0.3)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cube_state = sys.argv[1]
        print(solve(cube_state))
    else:
        # Default test case
        print(solve("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'"))
# convert solved state RRRRRRRRRBBBBBBBBBWWWWWWWWWGGGGGGGGGOOOOOOOOOYYYYYYYYY to UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB