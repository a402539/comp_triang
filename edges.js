"use strict";
var Edges = (function() {
    // points is an array of points, as defined in points.js
    // An edge is an array with 2 elements [i,j] where i and j are
    // indices of points in the points array.

    function edgesCross(edge1, edge2, points) {
        var p0 = points[edge1[0]];
        var p1 = points[edge1[1]];
        var p2 = points[edge2[0]];
        var p3 = points[edge2[1]];
        // Credit:
        // http://stackoverflow.com/a/30159167/41970
        var s1, s2;
        s1 = {x: p1.x - p0.x, y: p1.y - p0.y};
        s2 = {x: p3.x - p2.x, y: p3.y - p2.y};

        var s10_x = p1.x - p0.x;
        var s10_y = p1.y - p0.y;
        var s32_x = p3.x - p2.x;
        var s32_y = p3.y - p2.y;

        var denom = s10_x * s32_y - s32_x * s10_y;

        if(denom == 0) {
            return false;
        }

        var denom_positive = denom > 0;

        var s02_x = p0.x - p2.x;
        var s02_y = p0.y - p2.y;

        var s_numer = s10_x * s02_y - s10_y * s02_x;

        if((s_numer < 0) == denom_positive) {
            return false;
        }

        var t_numer = s32_x * s02_y - s32_y * s02_x;

        if((t_numer < 0) == denom_positive) {
            return false;
        }

        if((s_numer > denom) == denom_positive ||
           (t_numer > denom) == denom_positive) {
            return false;
        }

        var t = t_numer / denom;

        var p = {x: p0.x + (t * s10_x), y: p0.y + (t * s10_y)};

        if(p.x === p0.x && p.y === p0.y ||
           p.x === p1.x && p.y === p1.y ||
           p.x === p2.x && p.y === p2.y ||
           p.x === p3.x && p.y === p3.y) {
            // intersection at endpoint doesn't count
            return false;
        }
        
        return p;
    }
    
    function crossesEdges(new_edge, edges, points) {
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var p = edgesCross(new_edge, e, points);
            if(p) {
                return [e,p];
            }
        }
        return false;
    }
    
    return {crossesEdges:crossesEdges};
})();
