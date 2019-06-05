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

module powerbi.extensibility.visual.svgB4CCDB74B90E49689458B1A54603B89A  {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;
        private svg: d3.Selection<SVGElement>;
        private gradient: d3.Selection<SVGElement>;
        private colors = ['#001747','#70D6BC','#11487D','#38C7BD','#0E7FA6']

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            let node = this.insertSVG(cat);
            d3.select(options.element).node().appendChild(node);
            this.svg = d3.select("svg");
            this.gradient = this.svg.append("linearGradient").attr("id", "grad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%")
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            let rows = options.dataViews[0].table.rows;
            let sum = rows.reduce((sum, current) => {
                return sum + (current[1] as number);
            }, 0);
            let progress = 0;
            let i = 0;
            rows.forEach(element => {
                let percent = ((element[1] as number)/+sum)*100;
                let color = this.colors[i++%5];
                this.gradient.append("stop").attr("offset", `${progress+0.1}%`).attr("style", `stop-color:${color};stop-opacity:1`)
                progress += percent;
                this.gradient.append("stop").attr("offset", `${progress}%`).attr("style", `stop-color:${color};stop-opacity:1`)
            });
            d3.select("#cat")
                .attr("fill", "url(#grad)")
            

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
        public insertSVG(SVGString) {
            return new DOMParser().parseFromString(SVGString, 'application/xml').documentElement;
        };
    }
}