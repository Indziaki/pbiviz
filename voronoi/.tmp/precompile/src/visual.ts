/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual.voronoi7B43ACB5457247039595575AAF23004E  {
    "use strict";
    export interface Item{
        Key: string,
        Value: number
    }
    export interface VoronoiTestDatum {
        x: number;
        y: number;
    }
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private svg: d3.Selection<SVGElement>;
        private g: d3.Selection<SVGElement>;
        private div: d3.Selection<HTMLElement>;
        private colors: string[] = ['#DF5973','#FC6F58','#F5CDA1','#F5A00E','#419DA8','#BF0335','#021826','#D7EDF2','#0C7F8C','#F23535','#F2CB05','#F28705']

        constructor(options: VisualConstructorOptions) {
            this.svg = d3.select(options.element).append('svg');
            this.g = this.svg.append('g');
            this.div = d3.select(options.element).append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 1);
        }

        public update(options: VisualUpdateOptions) {
            let _this = this;
            let dat = Visual.converter(options);

            // get height and width from viewport
            _this.svg.attr({
                height: options.viewport.height,
                width: options.viewport.width
            });
            let gHeight = options.viewport.height
            let gWidth = options.viewport.width
            _this.g.attr({
                height: gHeight,
                width: gWidth
            });

            _this.svg.selectAll('path').remove()

            let sum = dat.reduce((sum, current) => {
                return sum + (current.Value as number);
            }, 0);
            let vertices = dat.map(function(d) {
                let percent = (d.Value/sum);
                return {x: Math.random()*gWidth, y: Math.random()*gHeight};
            });
            
            let voronoiTest = d3.geom.voronoi<VoronoiTestDatum>()
                .x(d => d.x)
                .y(d => d.y)
                .clipExtent([[0, 0], [gWidth, gHeight]])

            let polygons = _this.shuffleArray(voronoiTest(vertices))

            let polygon = (d) => {
                return "M" + d.join("L") + "Z"; 
              }

            let polyPath = _this.g
              .selectAll('path');
            polyPath
                .data(polygons)
                .enter()
                .append('path')
                .attr("stroke","white")
                .attr("stroke-width","2")
                .attr("fill",(d,i) => _this.colors[i%12] )
                .attr("opacity","0.9")
                .attr('d', polygon)
                .on('mouseover', function(d){
                    var coordinates= d3.mouse(this);
                    var x = coordinates[0];
                    var y = coordinates[1];
                    d3.select(this).attr("stroke-width","4")
                    d3.select(this).attr("opacity","1")
                    _this.div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                        _this.div.html(`${(Math.random()*100).toFixed(2)}%`)	
                        .style("left", `${x}px`)		
                        .style("top", `${y}px`);
                })
                .on('mouseout', function(d){	
                    _this.div.transition()		
                        .duration(500)		
                        .style("opacity", 0);
                    d3.select(this).attr("stroke-width","2")
                    d3.select(this).attr("opacity","0.9")
                });
            
            polyPath.order();

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }

        public static converter(options: VisualUpdateOptions): Item[] {
            let rows = options.dataViews[0].table.rows;
            let resultData: Item[] = [];
            for (let i = 0;i < rows.length;i++) {
                let row = rows[i];
                resultData.push({
                    Key: row[0].toString(),
                    Value: +row[1]
                });
            }
            return resultData;
        }
        public shuffleArray(array):[number, number][] {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

    }
}