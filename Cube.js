class Cube{
    constructor(r,g,b,_){
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [r, g, b, _];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }
    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangles3D([0.0, 0.0, 0.0,  1.0,1.0, 0.0,  1.0, 0.0, 0.0 ] );
        drawTriangles3D([0.0, 0.0, 0.0,  0.0,1.0, 0.0,  1.0, 1.0, 0.0 ] );
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangles3D([0.0, 0.0, 0.0,  0.0,0.0, 1.0,  0.0, 1.0, 1.0 ] );
        drawTriangles3D([0.0, 0.0, 0.0,  0.0,1.0, 1.0,  0.0, 1.0, 0.0 ] );

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangles3D([0.0, 1.0, 0.0,  0.0,1.0, 1.0,  1.0, 1.0, 1.0 ] );
        drawTriangles3D([0.0, 1.0, 0.0,  1.0,1.0, 1.0,  1.0, 1.0, 0.0 ] );
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangles3D([1.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 1.0, 1.0 ] );
        drawTriangles3D([1.0, 0.0, 0.0,  1.0,1.0, 1.0,  1.0, 1.0, 0.0 ] );
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangles3D([0.0, 0.0, 1.0,  1.0,1.0, 1.0,  1.0, 0.0, 1.0 ] );
        drawTriangles3D([0.0, 0.0, 1.0,  0.0,1.0, 1.0,  1.0, 1.0, 1.0 ] );
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangles3D([0.0, 0.0, 0.0,  0.0,0.0, 1.0,  1.0, 0.0, 1.0 ] );
        drawTriangles3D([0.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 0.0, 0.0 ] );
    }
}