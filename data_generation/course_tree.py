"""
    course_tree.py
"""

import sys
import plotly.offline as py
import plotly.graph_objects as go
import networkx as nx
from create_courses import create_courses
import webbrowser


def add_graph_nodes(graph, course):
    """
        Recursively builds a graph of recommended course dependencies
    """

    all_nodes = {}

    def recurse_nodes(graph, course, level=0):
        node = None
        if course.code in all_nodes:
            old_node = all_nodes[course.code]

            # Move the node down the graph since there's a chain of subject dependencies
            new_pos = min(level, old_node[2] + 1)
            new_node = (old_node[0], old_node[1], new_pos)

            graph.add_node(new_node)

            # Fix all the edges by having them point to/from the new node
            to_add = []
            for edge in graph.edges():
                if edge[0] == old_node:
                    to_add.append((new_node, edge[1]))
                elif edge[1] == old_node:
                    to_add.append((edge[0], new_node))

            # This will also remove all the old edges for us :)
            graph.remove_node(old_node)

            for edge in to_add:
                graph.add_edge(edge[0], edge[1])

            node = new_node
            all_nodes[course.code] = node
        else:
            # First time we've seen the course, add it to the dict
            node = (course.code, course.name, level)
            all_nodes[course.code] = node
            graph.add_node(node)

        for other_course in course.recommended_courses:
            # Recursively add nodes for recommended courses
            other_node = recurse_nodes(graph, other_course, level=level+1)
            graph.add_edge(node, other_node)

        return node

    recurse_nodes(graph, course)

def display_course_graph():
    courses = create_courses("course_data.p")

    # Build the graph
    graph = nx.MultiDiGraph(editable=True)
    current_courses = courses[sys.argv[1]]
    add_graph_nodes(graph, current_courses)

    # Layout the course nodes
    node_x = []
    node_y = []
    node_labels = []
    node_course_names = []

    level_x = {}
    x_positions = {}
    max_x = 0

    # Do y positions first. We also count how many nodes there are on each level here
    for node in graph.nodes():
        node_y.append(node[2])

        if not node[2] in level_x:
            level_x[node[2]] = 1
        else:
            level_x[node[2]] += 1
        max_x = max(max_x, level_x[node[2]])

        node_labels.append(node[0])
        node_course_names.append(node[1])

    level_progress = {}
    for node in graph.nodes():
        if not node[2] in level_progress:
            level_progress[node[2]] = 0

        # please don't ask how i came up with this
        # it was a lot of trial and error and blindly slamming into brick walls
        # all i know is that it centers the entire graph properly
        offset_x = (max_x - level_x[node[2]]) / 2
        x = offset_x + (level_progress[node[2]] / level_x[node[2]]) * level_x[node[2]]

        level_progress[node[2]] += 1
        x_positions[node[0]] = x

        node_x.append(x)

    # Layout the edges between the course nodes
    edge_x = []
    edge_y = []
    edge_info = []

    for edge in graph.edges():
        y0 = edge[0][2]
        y1 = edge[1][2]

        x0 = x_positions[edge[0][0]]
        x1 = x_positions[edge[1][0]]
        # print(f"{x0} {y0} -> {x1} {y1}")

        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])
        edge_info.append(f"{edge[0][2]} -> {edge[1][2]}")

    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        showlegend=False,
        text=node_labels,
        hoverinfo="text",
        hovertext=node_course_names,
        mode="markers+text",
        textposition="middle center",
        textfont=dict(
            family="arial",
            size=18
        ),
        marker=dict(
            size=90,
            color="#B2DB67"
        )
    )

    edge_trace = go.Scatter(
        x=edge_x,
        y=edge_y,
        showlegend=False,
        mode="lines",
        line=dict(width=5, color="#888")
    )

    layout = go.Layout(
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showline=False,
            ticks='',
            showticklabels=False
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showline=False,
            ticks='',
            showticklabels=False
        )
    )

    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=layout
    )

    py.plot(fig)

if __name__ == "__main__":
    display_course_graph()
