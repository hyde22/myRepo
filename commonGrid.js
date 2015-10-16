define(["jquery", "jquery.loadingMask", "app/columnModel", "app/HTMLTemplate"],function($, $LM, ColumnModel, TEMPLATE){
	console.log($.fn.loadingMask);
	//console.log($LM.fn.loadingMask);
	var CommonGrid=function(config){
		var defaults={
			gridID:'',
			containerID:'',
			stripeRows: true,
			autoLoad:true,
			autoRender: true,
			pagination: true,
			rendered : false,
			hasMenu : false,
			hasLiveupdateCol: false,
			rowSelectable: true,
			_eventQueue:{"beforeRender":[], "afterRender":[], "rowClick":[]}
		};
		$.extend(this,defaults,config);
		this.init();
	};
	CommonGrid.gridIDCounter=-1;
	CommonGrid.prototype={
		EmptyMsg: "No Data Available",
		init:function(){
		var self = this;
			this.columnModel = new ColumnModel({columns:this.columns});
			this.getDataStore().on("beforeLoad",self.maskBody, self);
			this.getDataStore().on("loadSuccess",self.unmaskBody, self);
			this.getDataStore().on("loadFailure",self.unmaskBody, self);
			this.getDataStore().on("loadSuccess",self.drawBody, self);
			if(this.pagination == true){
				this.on("afterRender", self.initPagination, self);
			}
			if(this.autoLoad == true){
				this.on("afterRender", function(grid){
					grid.getDataStore().load();
				});
			}
			if(this.autoRender == true){
				this.render();
			}
			if(this.hasMenu == true){
				this.getMenu().setParentComponent(this);
			}
			if(this.hasLiveupdateCol == true){
//				if(!Delta.OneJSONFieldSubscriber){
//					DefineSubsciber();
//				}
//				this.subscriber = new Delta.OneJSONFieldSubscriber({
//					parentTopic: this.parentTopic,
//					fieldName: this.fieldName,
//					subFields: this.columnModel.getLiveUpdateFields()
//				});
//				this.getDataStore().on("loadSuccess",function(result, ds, start, limit){
//					var records = this.pagination == true ? ds.getRecordsRange(start,start+limit+1):ds.getRecords();
//					var topicDataIndex = this.getColumnModel().getRowTopicDataIndex();
//					var record, topics=[];
//					for(var i=0; i<records.length; i++){
//						record=records[i];
//						topics.push(record[topicDataIndex]);
//					}
//					this.subscriber.subscribeTopics(topics);
//				}, self);
			}
		},
		initPagination: function(grid){
			grid.getGridElement().find(".fixed-table-container-inner").scroll(function(){
				var scroll 			= $(this)[0];
			  	var height 			= Math.floor(scroll.scrollHeight);
				var top 			= Math.floor(scroll.scrollTop);
		        var clientHeight 	= Math.floor(scroll.clientHeight);
		        if(top+clientHeight == height){
		        	grid.pagenationLoad();
		        }
			});
			grid.getDataStore().on("loadSuccess", function(result, ds){
				
				grid.paginationFlag = ds.getRecordCount()<ds.getTotal();
			});
		},
		pagenationLoad: function(){
			if(this.paginationFlag == true){
				this.paginationFlag = false;
				this.getDataStore().load();
			}
		},
		maskBody: function(){
			this.getGridElement().loadingMask();
		},
		unmaskBody: function(){
			this.getGridElement().unLoadingMask();
		},
		drawHeader: function(){
			var colM = this.columnModel, ths ="", thClass;
			for(var i=0; i<colM.getCount(); i++){
				thClass=i==0?"first":"";
				ths += TEMPLATE.TH.replace("@THCLASS",thClass).replace("@THWIDTH",colM.getWidth(i)).replace("@HEADER",colM.getHeader(i));
			}
			return TEMPLATE.THEADER.replace("@THS",ths);
		},
		drawBody: function(result, ds, start, limit){
			var records = this.pagination == true ? ds.getRecordsRange(start,start+limit+1):ds.getRecords();
			var r, colM=this.columnModel, trs="", tds;
			var parentTopic=this.parentTopic;
			for(var i=0; i<records.length; i++){
				r=records[i];
				tds="";
				for(var j=0; j<colM.getCount(); j++){
					if(colM.isUpdateField(j)){
						tds+="<td id='"+parentTopic+"/"+r[colM.getTopicDataIndex(j)]+"_"+colM.getUpdateField(j)+"' class='"+colM.getCss(j)+"'>"+colM.getDataRenderer(j)(r[colM.getDataIndex(j)],r)+"</td>";
					}else{
						tds+="<td class='"+colM.getCss(j)+"'>"+colM.getDataRenderer(j)(r[colM.getDataIndex(j)], r)+"</td>";
					}
				}
				trs+="<tr>"+tds+"</tr>";
			}
			if(records.length ==0 && start==0){
				trs+="<div class='emptyMsg'>"+this.EmptyMsg+"</div>";
				this.getGridElement().find(".fixed-table-container-inner").append(trs);
				return;
			}
			this.getGridBody().append(trs);
			if(this.hasTooltipColumns){
				this.getGridBody().find("td a").tooltip();
			}
			if(this.stripeRows === true){
				this.getGridBody().find("tr:odd").addClass("odd").parent().find("tr:even").addClass("even");
			}
			if(!this.bBodyEventBinded){
				this.initContentEvent();
			}
		},
		selectRowHandler:function(){
			$(this).parent().find("tr.selected").removeClass("selected").end().end().addClass("selected");
			//return true;
		},
		getSelectedRowIndex: function(){
			var $tbody = this.getGridBody();
			return $tbody.find("tr").index($tbody.find("tr.selected")); 
		},
		initContentEvent:function(){
			var $tbody = this.getGridBody();
			var self =this;
			this.bBodyEventBinded=true;
			if(this.rowSelectable === true){
				$tbody.delegate("tr", "click",this.selectRowHandler).delegate("tr", "mousedown", function(event){
					if(event.which ==3){
						self.selectRowHandler.call(this);
					}
				});
			}
			if(this.hasMenu === true){
				$tbody.delegate("tr", "contextmenu", function(event){
					self.getMenu().show(event);
					return false;
				});
			}
		},
		drawGrid: function(){
			var id = this.getGridID();
			var gridHTML = TEMPLATE.GRID.replace("@GRID_ID",id).replace("@THEADER",this.drawHeader());
			return gridHTML;
		},
		load: function(config){
			
		},
		render:function(){
			if(!this.containerID || this.rendered == true)
				return;
			this.renderTo(this.containerID);
			
		},
		renderTo:function(containerID){
			if(containerID && $("#"+containerID).length>0 && this.rendered ==false){
				this.triger("beforeRender", this);
				$("#"+containerID).append(this.drawGrid());
				this.containerID = containerID;
				this.rendered = true;
				this.triger("afterRender", this);
			}
		},
		getGridElement:function(){
			return $("#"+this.getGridID());
		},
		getGridBody:function(){
			return $("#"+this.getGridID()).find(".fixed-table-container-inner tbody");
		},
		getParentPortlet: function(){
			if(this.portletID){
				return $(this.portletID);
			}
			else{return null;}
		},
		getGridID:function(){
			if(!this.gridID){
				this.gridID = "commonGrid"+(++CommonGrid.gridIDCounter);
			}
			return this.gridID;
		},
		getDataStore: function(){
			return this.dataStore;
		},
		getColumnModel:function(){
			return this.columnModel;
		},
		getMenu:function(){
			return this.menu;
		},
		on:function(eventName, handler, scope){
			if(!this._eventQueue[eventName] || !handler || !$.isFunction(handler))
				return;
			this._eventQueue[eventName].push({handler:handler, scope: scope});
		},
		triger:function(eventName,args){
			if(arguments.length>=2){
				args = Array.prototype.slice.call(arguments, 1);
			}
			if(this._eventQueue[eventName]){
				var i=this._eventQueue[eventName].length, scope;
				while(i--){
					scope = this._eventQueue[eventName][i].scope || this;
					this._eventQueue[eventName][i].handler.apply(scope,args);
				}
			}
		}
	};
	return CommonGrid;
})
