define(["jquery"], function($){
	var DataSource=function(config){
		var defaults = {
			pagination:false,
			type: "post",
			dataType: null,
			url: null,
			root:null,
			total:null,
			totalProperty: null,
			isDummy:false,
			data: null,
			_records:[],
			_eventQueue:{"beforeLoad":[],"loadSuccess":[],"loadFailure":[]},
			onBeforeLoad: null,
			onLoadSuccess: null,
			onLoadFailure: null
		};
		$.extend(this,defaults,config);
		this.init();
	};
	DataSource.prototype={
		constructor: DataSource,
		init: function(){
			if(this.onBeforeLoad){
				this.on("beforeLoad", this.onBeforeLoad);
			}
			if(this.onLoadSuccess){
				this.on("loadSuccess", this.onLoadSuccess);
			}
			if(this.onLoadFailure){
				this.on("loadFailure", this.onLoadFailure);
			}
		},
		on:function(eventName, handler, scope){
			if(!this._eventQueue[eventName] || !handler || !$.isFunction(handler))
				return;
			this._eventQueue[eventName].push({handler:handler, scope: scope});
		},
		removeHandler:function(eventName, handler){
			if(!this._eventQueue[eventName] || !handler || !$.isFunction(handler))
				return false;
			for(var i in this._eventQueue[eventName]){
				if(this._eventQueue[eventName][i].handler === handler){
					this._eventQueue[eventName].splice(i,1);
					return true;
				}
			}
		},
		triger:function(eventName,args){
			if(arguments.length>=2){
				args = Array.prototype.slice.call(arguments, 1);
			}
			if(this._eventQueue[eventName]){
				var i=this._eventQueue[eventName].length, scope;
				while(i--){
					scope = this._eventQueue[eventName][i].scope ? this._eventQueue[eventName][i].scope : this;
					this._eventQueue[eventName][i].handler.apply(scope,args);
				}
			}
		},
		/******************************
		 * params:type
		 * param: url,
		 * param: param,
		 * param: pagination,
		 * param: start,
		 * param: limit,
		 * param: startProperty,
		 * param: limitProperty,
		 * param: totalProperty,
		 * param: root
		 * @return
		 */
		load: function(config){
			$.extend(this,config);
			var self = this;
			this.triger("beforeLoad", this);
			if(this.isDummy == true){
				this.parse(this.data);
				this.triger("loadSuccess", this.data, this, 0, this.data.length);
			}
			else{
				$.ajax({
					type:self.type || "post", 
					url: self.url, 
					dataType: self.dataType || "json", 
					data: self.param, 
					async: true,
					success: function(result){
						self.parse(result);
						self.triger("loadSuccess", result, self, self.start, self.limit);
						self.setParamForPaging();
					}, 
					error : function(result){
						self.triger("loadFailure", result, self);
					}
				});
			}
		},
		parse: function(result){
			function getValue(result,path){
				var r=result, subPath, arr;
				if(!result || !path)return;
				arr = path.split(".");
				for(var i=0; i<arr.length; i++){
					subPath = arr[i];
					if(subPath && r[subPath]){
						r=r[subPath];
					}else{
						return;
					}
				}
				return r;
			}
			if(this.totalProperty){
				this.total = getValue(result,this.totalProperty);
			}
			if(!this.root)
				return;
			var records = getValue(result,this.root) || [];
			if(this.pagination === true){
				this._records = this._records.concat(records);
			}else{
				this._records = records;
			}
		},
		setParamForPaging:function(){
			if(this.pagination == true){
				this.start+=this.limit;
				this.param[this.startProperty] = this.start;
			}
		},
		getTotal: function(){
			return this.total || this._records.length;
		},
		getRecords:function(){
			return this._records;
		},
		getRecordCount: function(){
			return this._records.length;
		},
		getRecordAt: function(index){
			return this._records.length > index? this._records[index]: null; 
		},
		getRecordsRange:function(){
			return this._records.slice.apply(this._records, arguments);
		},
		clear: function(){
			this._records = [];
		}
	};
	console.log(typeof DataSource)
	return DataSource;
});
