function(view, data, actionIndex, rowIndex, event) {
	var dialogName = actionIndex;
	var viewName = actionIndex;

	if (rowIndex == null) {
		// rowIndex = view.getGrid().datagrid("getSelected");
	}
	if (rowIndex < 0) {
		$.messager.alert("提示", "请选择要操作的数据", "info");
		return;
	}
	var selectedData = got.removeNoUseData(view.getGrid().datagrid("getData").rows[rowIndex]);

	if (view.dialogs[dialogName]) {
		view.dialogs[dialogName].openerSelectedData = selectedData;
	}
	var getDataFunction = function(view, data, actionIndex, rowIndex, successCallback) {
		view.dialogs[dialogName].queryGridData();
		if (successCallback) {
			successCallback();
		}
	};

	view.getGrid().datagrid("clearSelections");
	if (view.dialogs[dialogName]) {
		$(view.dialogs[dialogName].getId("queryValue")).val('');
		$(view.dialogs[dialogName].getId("pageNumber")).val('1');
		view.dialogs[dialogName].openerSelectedData = selectedData;
		getDataFunction(view, data, actionIndex, rowIndex, function() {
			$(view.getId(dialogName)).dialog("open");
			$(view.dialogs[dialogName].getId("queryValue")).focus();
		});
		return;
	}
	var postData = view.buildFormDataObject(view, viewName);
	var actionArg = view.actionArg[actionIndex];
	if (actionArg) {
		if (actionArg["selectFunction"]) {
			postData["fwCoord.function"] = actionArg["selectFunction"];
		}
		if (actionArg["selectView"]) {
			postData["fwCoord.view"] = actionArg["selectView"];
		}
	}
	postData["fwParam.openerId"] = view.id;
	postData["fwParam.openerFunction"] = $(view.getId("function")).val();
	postData["fwParam.openerView"] = $(view.getId("view")).val();
	postData["fwParam.openerActionId"] = actionIndex;
	postData["fwParam.openerSelectedData"] = selectedData;
	postData['fwParam.showAsDialog'] = "1";
	got.ajax({
		cache : true,
		type : "POST",
		url : "getDialog",
		dataType : "html",
		data : postData,
		async : true,
		error : function(res, ts, e) {
			alert("打开错误:" + ts);
		},
		success : function(returnData) {
			if (returnData == null) {
				$.messager.alert('提示', '打开错误');
				return;
			}
			var content = '<div id="' + view.id + "_" + dialogName + '">' + returnData + '</div>';
			$(content).appendTo($(view.getId("dialogs")));
			var width = 800;
			try {
				width = view.dialogs[dialogName].width;
			} catch (error) {
				
			}
			var height = 600;
			try {
				height = view.dialogs[dialogName].height;
			} catch (error) {
				
			}
			// load data and show dialog
			getDataFunction(view, data, actionIndex, rowIndex, function() {

				$(view.getId(dialogName)).dialog({
					width : width,
					height : height,
					title : view.dialogs[dialogName].title,
					modal : true,
					iconCls : view.actionArg[actionIndex] ? view.actionArg[actionIndex]['icon'] : '',
					buttons : [ {
						text : '确定',
						iconCls : 'icon-save',
						handler : function() {
							// TODO
							// get old selected data
							// get new selected data
							// submit
							// var newData = data =
							// view.dialogs[dialogName].getForm().serializeObject();
							var postData = view.dialogs[dialogName].buildFormDataObject(view.dialogs[dialogName], null);
							var oldListData = [];
							var list = view.dialogs[dialogName].data.data;
							for ( var i = 0; i < list.length; ++i) {
								if (list[i]["FW_SELECTED"]) {
									oldListData.push(got.removeNoUseData(list[i]));
								}
							}
							var newListData = [];
							list = $(view.dialogs[dialogName].getId("datagrid")).datagrid("getSelections");
							for ( var i = 0; i < list.length; ++i) {
								newListData.push(got.removeNoUseData(list[i]));
							}
							postData["fwParam.oldListData"] = oldListData;
							postData["fwParam.newListData"] = newListData;
							got.ajax({
								cache : true,
								type : "POST",
								url : "saveSelectData",
								dataType : "text",
								data : postData,
								async : true,
								error : function(res, ts, e) {
									$.messager.alert('提示', "更新错误:" + ts, 'error');
								},
								success : function(errorMsg) {
									if (errorMsg) {
										$.messager.alert('提示', "更新错误:" + errorMsg, 'error');
									} else {
										$(view.getId(dialogName)).dialog("close");
										$.remind('提示', '保存成功', "info", 1600);
										view.queryGridData();
									}
									// return errorMsg;
								}
							});
						}
					}, {
						text : '关闭',
						// iconCls : 'icon-back',
						handler : function() {
							// TODO check if modified and prompt
							$(view.getId(dialogName)).dialog("close");
						}
					}, ],
				});
				$(view.dialogs[dialogName].getId("queryValue")).focus();
			}); // getDataFunction
		}, // success
	}); // ajax
}