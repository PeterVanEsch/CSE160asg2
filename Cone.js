class Cone {
    constructor(){
        this.type = 'cone';
        this.position = [0.0, 0.0, 0.0]; // Center position of the cone base
        this.color = [1, 0.8, 0.2, 1.0]; // Color of the cone
        this.size = 22.0; // Radius of the cone base
        this.height = 0.3; // Height of the cone
        this.segments = 20; // Number of segments in the circle base
        this.matrix = new Matrix4();
    }

    render(){
        
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var height = this.height;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = size / 200.0;
        var hStep = height / this.segments; // Height step

        let angleStep = 360 / this.segments;
        let darkenFactor = 1.0;
        for(var angle = 0; angle < 360; angle += angleStep){
            
            let centerPoint = [0, 0];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
            let p1 = [centerPoint[0] + vec1[0], centerPoint[1] + vec1[1]];
            let p2 = [centerPoint[0] + vec2[0], centerPoint[1] + vec2[1]];
            

            // Define vertices for the base of the triangle
            let vertexBase = [xy[0], xy[1], xy[2]];

            // Define vertices for the tip of the cone
            let vertexTip = [xy[0], xy[1], xy[2] + height];

            // Define vertices for the edges of the triangle
            let vertex1 = [p1[0], p1[1], xy[2] + hStep];
            let vertex2 = [p2[0], p2[1], xy[2] + hStep];

            // Draw the triangles
            //drawTriangles3D([vertexBase[0], vertexBase[1], vertexBase[2],
                             //vertex1[0], vertex1[1], vertex1[2],
                             //vertex2[0], vertex2[1], vertex2[2]]);

            gl.uniform4f(u_FragColor, rgba[0] * darkenFactor, rgba[1] * darkenFactor, rgba[2] * darkenFactor, rgba[3]);
            // Draw the triangle from the tip to the edges
            drawTriangles3D([vertexTip[0] -0.05, vertexTip[1] -0.15, vertexTip[2] - 0.38,
                             vertex1[0] - 0.05 , vertex1[1] - 0.15, vertex1[2] - 0.38 ,
                             vertex2[0]- 0.05, vertex2[1] -0.15, vertex2[2] - 0.38]);

            if ( angle < 180){
                darkenFactor -= 0.075; // You can adjust the value as needed
            }
            else{
                darkenFactor += 0.075;
            }
            
        }
        
    }
}
