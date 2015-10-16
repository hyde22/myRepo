define(["jquery"], function($){
	var ColumnModel=function(config){
		var defaults = {
			columns:[]
		};
		$.extend(this,defaults,config);
		this.init();
	};
	
	ColumnModel.showColor = function( value ){
		var className = '';
		var nVal=parseFloat(value);
		if( isNaN(nVal) ) {
			value = '';
		}else {
			value = (Math.round((nVal)*100)/100).toFixed(2);
		}
		
		value >= 0 ? className = 'font-green': className = 'font-red';
		value = '<span class="'+ className + '">' + value + '</span>';
		return value;
	};
	ColumnModel.toolTipRenderer = function(value){
		var tmp = '<a rel="@CONTENT" href="javascript:void(0);">@CONTENT</a>';
		return tmp.replace(/@CONTENT/g, value);
	}
	ColumnModel.numberRenderer = function(value){
		var nVal=parseFloat(value);
		if(isNaN(nVal) == false){
			nVal=(Math.round((nVal)*100)/100).toFixed(2);
			return nVal;
		}else{
			return "";
		}
	}
	ColumnModel.simpleNumberRenderer = function(value){
		var nVal=parseFloat(value);
		if(isNaN(nVal) == false){
			return nVal;
		}else{
			return "";
		}
	}
	ColumnModel.midValRenderer = function(data, r){
		var bid=parseFloat(r["BID"]), ask=parseFloat(r["ASK"]), mid="";
		if(isNaN(bid) == false && isNaN(ask) == false )
			mid=(Math.round((bid+ask)*100)/200).toFixed(2);
		return mid;
	}
	ColumnModel.dateRenderer = function(val){return (val && typeof val == "string" && val.substring(0,10) || "");}
	
	ColumnModel.prototype={
		constructor: ColumnModel,
		init:function(){
			var defaults={
				width:"",
				header:"",
				dataIndex:"",
				css:"",
				renderer:function(val){return val || "";},
				compare: false,
				liveUpdateFlag: false,
				liveUpdateField: ""
			}, arr=[],tmp;
			for(var i=0; i<this.columns.length; i++){
				tmp={};
				$.extend(tmp, defaults,this.columns[i]);
				arr.push(tmp);
			}
			this.columns = arr;
		},
		getCss: function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].css: ""},
		getCount: function(){return this.columns.length},
		getHeader: function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].header: ""},
		getWidth: function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].width: ""},
		getDataIndex:function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].dataIndex: null},
		getTopicDataIndex:function(colIndex){return colIndex<this.columns.length && this.columns[colIndex].topicDataIndex ?this.columns[colIndex].topicDataIndex: ""},
		getUpdateField:function(colIndex){return colIndex<this.columns.length && this.columns[colIndex].liveUpdateField ?this.columns[colIndex].liveUpdateField: ""},
		getRowTopicDataIndex:function(){
			var crr;
			for(var i=0; i < this.columns.length; i++){
				crr=this.columns[i];
				if(crr.topicDataIndex){
					return crr.topicDataIndex;
				}
			}
			return "";
		},
		getDataRenderer:function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].renderer: null},
		isUpdateField:function(colIndex){return colIndex<this.columns.length?this.columns[colIndex].liveUpdateFlag: false},
		getLiveUpdateFields:function(){
			var fields=[], crr;
			for(var i=0; i<this.columns.length; i++){
				crr=this.columns[i];
				if(crr.liveUpdateFlag === true){
					fields.push({name:crr.liveUpdateField, renderer:crr.renderer, compare: crr.compare});
				}
			}
			return fields;
		}
	};
	return ColumnModel;
})
