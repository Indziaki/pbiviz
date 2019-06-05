module powerbi.extensibility.visual.gGGCardE0155DA81B524370B1428A89816AABAC  {
    export interface TestItem {
        Country: string;
        Amount: number;
    }
    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private svg: d3.Selection<SVGElement>;
        private g: d3.Selection<SVGElement>;
        private margin = { top: 20, right: 20, bottom: 200, left: 70 }; 
        private div: d3.Selection<HTMLElement>;
        constructor(options: VisualConstructorOptions) {
            // append svg into the visual element
            this.svg = d3.select(options.element).append('svg');
            this.g = this.svg.append('g');
            // Define the div for the tooltip
            this.div = d3.select(options.element).append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 1);
            
            this.g.append("pattern")
                .attr("x", 0).attr("y", 0).attr("width", 4).attr("height", 4).attr("id","image1").attr("patternUnits", "userSpaceOnUse")
                //.append("polygon").attr("points", "0,0 2,5 0,10 5,8 10,10 8,5 10,0 5,2")
                .append("circle").attr("cx", 4).attr("cy", 4).attr("r", 2)
                //.append("image").attr("xlink:href", "assets/house.svg")
                .attr("fill", "#900C3E")//.attr("fill-rule", "evenodd")
        }

        public update(options: VisualUpdateOptions) {
            let _this = this;

            // get height and width from viewport
            _this.svg.attr({
                height: options.viewport.height,
                width: options.viewport.width
            });
            let gHeight = options.viewport.height
                - _this.margin.top
                - _this.margin.bottom;
            let gWidth = options.viewport.width
                - _this.margin.right
                - _this.margin.left;
            _this.g.attr({
                height: gHeight,
                width: gWidth
            });
            _this.g.attr('transform',
                `translate(${ _this.margin.left}, ${ _this.margin.top})`);

            // convert data format
            let dat = Visual.converter(options);

            // setup d3 scale
            let xScale = d3.scale.ordinal()
                .domain(dat.map( (d)=> { return d.Country; }))
                .rangeRoundBands([0, gWidth], 0.5);

            let yMax = d3.max(dat,  (d)=> { return d.Amount});
            let yMargin = Math.floor(yMax/10);

            let yScale = d3.scale.linear()
                .domain([0, (yMax + yMargin)])
                .range([gHeight, 0]);

            // remove existing axis and bar
            _this.svg.selectAll('.axis').remove();
            _this.svg.selectAll('.bar').remove();
            _this.svg.selectAll('.area').remove();

            // draw x axis
            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom');
            _this.g
                .append('g')
                .attr('class', 'x axis')
                .style('fill', '#33507E')
                .attr('transform', `translate(0, ${(gHeight - 0.5)})`)
                .call(xAxis)
                .selectAll('text') // rotate text
                .style('text-anchor', 'end')
                .attr('dx', '-1.5em')
                .attr('dy', '1.6em')
                .attr('transform', 'rotate(-45)');

            // draw y axis
            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left');
            _this.g
                .append('g')
                .attr('class', 'y axis')
                .style('fill', '#33507E')
                .call(yAxis);
            
            // draw area
            let area = _this.g
            .append("path")
            .datum(dat)
            .attr("class", "area")
            .attr("d", d3.svg.area<TestItem>()
                .interpolate("cardinal")
                .x(function(d) { return xScale(d.Country)+(xScale.rangeBand()/2) })
                .y0(gHeight)
                .y1(function(d) { return yScale(d.Amount) })
            )

            // draw bar
            let shapes = _this.g
                .append('g')
                .selectAll('.bar')
                .data(dat);
            let total = dat.reduce((sum, current) => sum + current.Amount, 0)

            shapes.enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('fill', (d) => {
                    return (d.Amount < (total/dat.length)) ?  "#E43D70": "#3BACB6";
                })
                //.attr('fill', '#88B25D')
                .attr('x', (d) => {
                    return xScale(d.Country);
                })
                .attr('width', xScale.rangeBand())
                .attr('y', gHeight)
                .attr('height', 0)
                .on("mouseover", function(d) {	
                    _this.div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                        _this.div.html(`${d.Country}:<br> ${_this.formatThousand(d.Amount)}`)	
                        .style("left", `${xScale(d.Country)+(xScale.rangeBand())+28}px`)		
                        .style("top", `${yScale(d.Amount)-15}px`);
                    d3.select(this).attr("fill", "url(#image1)")	
                })
                    
                .on("mouseout", function(d) {		
                    _this.div.transition()		
                        .duration(500)		
                        .style("opacity", 0);
                    d3.select(this).attr("fill", (d.Amount < (total/dat.length)) ?  "#E43D70": "#3BACB6")
                })
                .transition()
                .ease(d3.ease("elastic-in"))
                .duration(1000)
                .attr('y', (d)=> {
                    return yScale(d.Amount);
                })
                .attr('height',(d) => {
                    return gHeight - yScale(d.Amount);
                });

            shapes
                .exit()
                .remove();

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public static converter(options: VisualUpdateOptions): TestItem[] {
            let rows = options.dataViews[0].table.rows;
            let resultData: TestItem[] = [];
            for (let i = 0;i < rows.length;i++) {
                let row = rows[i];
                resultData.push({
                    Country: row[0].toString(),
                    Amount: +row[1]
                });
            }
            return resultData;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }

        public formatThousand(num) {
            var p = num.toFixed(2).split(".");
            return p[0].split("").reverse().reduce(function(acc, num, i, orig) {
                return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
            }, "") + "." + p[1];
        }
        public standardDeviation(values) {            
            const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length;
            return Math.sqrt(average(values.map(value => (value - average(values)) ** 2)))
    };
    }
}