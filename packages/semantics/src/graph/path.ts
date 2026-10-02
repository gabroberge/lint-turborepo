/**
 * # Graph: paths
 *
 * A path through a graph, as the edges walked from its start in order. The
 * empty path leads from a node to itself. Edges are whatever values the
 * caller's edge function yields, so a path can carry evidence (a call site,
 * an access) rather than only the nodes it visits.
 */
export type Path<Edge> = readonly Edge[];
