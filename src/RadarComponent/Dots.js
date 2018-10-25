import React, { Component } from 'react';
//import moment from 'moment'
import util from './utils.js'
import DotViewer from './DotViewer.js'
import PropTypes from 'prop-types';
import Dot from './Dot.js';

class Dots extends Component {


	constructor(props) {
		super();

		let state = {
			width:window.innerWidth,
			height:window.innerHeight,
		}
		this.state = state;
		this.variableRowSizeFactor = .8;


	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener('resize', this.updateDimensions.bind(this));
		/*setInterval(() => {
			for(let i = 0; this.dotsObjs && i < this.dotsObjs.length; i++)
				for(let j = 0; j < this.dotsObjs[i].length; j++)
					
		},4000)	*/
	}

	updateDimensions() {
		let state = this.state;
		state.width = window.innerWidth;
		state.height = window.innerHeight;
		this.setState(state);
	}

	//Make Dot Componenent so it can do its own opacity management
	makeDot(dot) {
		var distanceFromCenter = dot.distanceFromCenter;
		var angle = dot.startAngle + dot.angle;
		var point = util.polarToCartesian(this.view.dots.center.x,this.view.dots.center.y,distanceFromCenter,angle);
		if(!dot.r) dot.r = this.view.dots.radius;
		
		return <Dot center={point} radius={dot.r} fill={dot.color} 
		onMouseDown={this.onMouseDownDot.bind(this)} 
		dot={dot}
		setRestartOpacityFunction={this.setRestartOpacityFunction.bind(this)}
		/>
	}

	fillDotsObjs(subjects) {
		if(!subjects) return;

		this.dotsObjs = [];
		let i, j, angle;
		if(subjects && subjects.length)
			angle = 360/subjects.length;
		else
			angle = 0;

		for(i = 0; subjects && i < subjects.length; i++) {
			this.dotsObjs[i] = [];
			for(j = 0; j < subjects[i].assignments.length; j++) {
				let assignment = subjects[i].assignments[j];
				let distanceFromCenter = this.props.getDistanceFromCenter(assignment);
				if(distanceFromCenter <= -1) continue;
				if(distanceFromCenter < -1) continue;
				let color = this.props.view.colors.typeColors[assignment.type.toLowerCase().replace(" ",'')];
				if(!color)
					color = 'white';
				this.dotsObjs[i].push({
					key:(subjects[i].name+'/'+assignment.name+'/'+assignment.dueDate.format('YYYY-MM-DD HH:mm')),
					distanceFromCenter:distanceFromCenter,
					radius:15,
					startAngle:i*angle,
					maxAngle:angle,
					angle:.5*angle,
					color:color,
					assignment:assignment
				})
			}
		}
	}

	setRestartOpacityFunction(func) {
	}

	getDotRows(dots, fixed, numSteps) {
		if(!dots || dots.length === 0) return null;
		dots.sort(this.compareDots);
		if(fixed && !numSteps)
			numSteps = 10;

		var outerBoundary, innerBoundary, currRow = 0, rows, step, start;

		if(fixed) {
			start = 0;
			step = this.view.radar.radius/numSteps;
			outerBoundary = this.view.radar.radius;
			innerBoundary = outerBoundary-step;
			rows = [[]];
		} else {
			start = 1;
			step = this.view.dots.radius*2;
			outerBoundary = dots[0].distanceFromCenter;
			innerBoundary = outerBoundary - step;
			rows = [[dots[0]]];
			currRow = 0;
		}

		for(let i = start; i < dots.length; i++) {
			//If in boundry, add it to the row
			if(innerBoundary < dots[i].distanceFromCenter && dots[i].distanceFromCenter <= outerBoundary) {
				//Add the dot to the current row
				rows[currRow].push(dots[i]);
				if(!fixed) {
					innerBoundary = dots[i].distanceFromCenter - step;
					//Decrement the next step by a factor of .9 to curb number of rows
					step *= this.variableRowSizeFactor;
				}
				if(innerBoundary < 0) break;
			} else {
				if(fixed){//Increase the boundry a fixed amount and create new row
					i--;
					outerBoundary = innerBoundary;
					innerBoundary -= step;
					currRow++;
					rows[currRow] = [];
				} else {//Set new boundry at next dot, create new row
					outerBoundary = dots[i].distanceFromCenter
					innerBoundary = outerBoundary - this.view.dots.radius*2;
					if(innerBoundary < 0) break;
					currRow++;
					rows[currRow] = [dots[i]];
					step = this.view.dots.radius*2;
				}
			}
		}

		return rows;
	}

	disperseRow(row, maxAngle) {
		if(!row || !row.length) return;

		let rowAngles = [], step;
		if(this.props.subjects.length > 1)
			step = maxAngle / (row.length+1);
		else 
			step = maxAngle / (row.length);

		//Fill an array of the angles that will be "claimed" by the dots in the row
		for(var k = 0; k < row.length; k++) 
			rowAngles.push((k+1)*step);
		//if odd amount of dots, do first and then only worry about even
		var rowAngleIndex, rowIndex, close = (row.length % 2 !== 0);
		while(row.length > 0) {
			if(row.length % 2 === 0) close = !close;//Switch doing close every two times

			rowAngleIndex = Math.floor(rowAngles.length/2);
			if(close)//Take dot from the back (dots close to center)
				rowIndex = row.length-1;
			else//Take dot from the front (dots close to the edge)
				rowIndex = 0;

			//Set the dot's angle and radius and then remove it and the angle it claimed from the list
			row[rowIndex].angle = rowAngles[rowAngleIndex];
			row.splice(rowIndex,1);
			rowAngles.splice(rowAngleIndex,1);
		}
	}

	compareDots(a,b) {
		if(a.distanceFromCenter < b.distanceFromCenter)
			return 1;
		if(a.distanceFromCenter > b.distanceFromCenter)
			return -1;
		return 0;
	}

	shuffleDots(dots) {
		if(dots.length < 1) return;
		
		let rows = this.getDotRows(dots);

		for(let i = 0; i < rows.length; i++) {
			let row = rows[i];
			if(row.length === 0) continue;
			
			this.disperseRow(row,row[0].maxAngle);
		
		}
	}


	onClickDot(e) {
		let dotsGroup = document.getElementById('dotsGroup');
		dotsGroup.insertBefore(e.target,null);
		//this.openDotViewer(e.target,dotViewer);
		let dotViewer = document.getElementById('dotViewer');
		dotsGroup.insertBefore(dotViewer,null);
		let state = this.state;
		state.clickedDot = {
			x:e.target.getAttribute('cx'),
			y:e.target.getAttribute('cy'),
			fill:e.target.getAttribute('fill'),
		}
		this.setState(state);
	}

	onMouseDownDot(e) {
		console.log('down');
		this.closeDotViewer();
		this.draggedDot = {
			dot:e.target, 
			moved:false, 
			mousemove:this.onMouseMoveDot.bind(this), 
			mouseup:this.onMouseUpDot.bind(this),
			onclick:this.onClickDot.bind(this),
			original:{cx:e.target.getAttribute('cx'), cy:e.target.getAttribute('cy')}
		};
		window.addEventListener('mousemove', this.draggedDot.mousemove);
		window.addEventListener('mouseup',this.draggedDot.mouseup);


	}

	onMouseMoveDot(e) {
		this.draggedDot.moved = true;
		let dotsGroup = document.getElementById('dotsGroup');
		dotsGroup.insertBefore(this.draggedDot.dot,null);
		let offsetY = dotsGroup.getBoundingClientRect().top;
		let offsetX = dotsGroup.getBoundingClientRect().left;
		
		//onScroll change the dotsGroup x,y to the current ViewPorts X and Y on the Page
		this.draggedDot.dot.setAttribute('cx',e.clientX-offsetX)
		this.draggedDot.dot.setAttribute('cy',e.clientY-offsetY)
		this.draggedDot.dot.setAttribute('r',this.view.dots.radius*1.5);
	}

	onMouseUpDot(e) {
		window.removeEventListener('mousemove',this.draggedDot.mousemove);
		window.removeEventListener('mouseup',this.draggedDot.mouseup);
		this.draggedDot.dot.setAttribute('r',this.view.dots.radius);
		if(this.draggedDot.moved) {
			this.checkIntersectFunctions(this.draggedDot.dot.getAttribute('cx'),this.draggedDot.dot.getAttribute('cy'));
		}
		this.draggedDot.dot.setAttribute('cx',this.draggedDot.original.cx);
		this.draggedDot.dot.setAttribute('cy',this.draggedDot.original.cy);
		if(!this.draggedDot.moved) {
			this.onClickDot(e);
		} 
		this.draggedDot = null;
	}

	checkIntersectFunctions(x,y) {
		if(!this.props.intersectFunctions) return;
		
		this.props.intersectFunctions.map((obj) => {
			if(obj.rect && obj.func) {
				if(x <= obj.rect.x+obj.rect.width && x >= obj.rect.x 
					&& y <= obj.rect.y+obj.rect.height && y >= obj.rect.y)
						obj.func();
			}
		})
	}

	closeDotViewer() {
		let state = this.state;
		state.clickedDot = null;
		this.setState(state);
	}


	render() {
		this.view = this.props.dims;
		var subjects = this.props.subjects;


		this.fillDotsObjs(subjects);
		this.dotsElems = [];
		for(let i = 0; this.dotsObjs && i < this.dotsObjs.length; i++) {
			this.shuffleDots(this.dotsObjs[i]);
			for(let j = 0; j < this.dotsObjs[i].length; j++)
				this.dotsElems.push(this.makeDot(this.dotsObjs[i][j]));
		}

		return (
			<svg x={0} y={0} width={this.state.width} height={this.state.height} id="dotsGroup" stroke="black" strokeWidth="2">
				{this.dotsElems}
				<DotViewer width={this.props.dims.dotViewer.width} height={this.props.dims.dotViewer.height} dot={this.state.clickedDot} closeDotViewer={this.closeDotViewer.bind(this)}/>
			</svg>

		)
	}
}

Dots.propTypes = {
  	view: PropTypes.object.isRequired,
  	subjects: PropTypes.array.isRequired,
  	getDistanceFromCenter: PropTypes.func.isRequired
}

export default Dots;

//need to find a way to have the dragged dot be on top of the spinline, but stationary dots be below
//And also have dotviewer be on top of spinline
