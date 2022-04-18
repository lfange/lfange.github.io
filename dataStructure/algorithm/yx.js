include(baseModule + "EpBox/EpBox.js");
var FlagTL = 0;
var FlagCL = 0;
var ISHZT = null;
var IBRLX = null;
var bfzchage = false;

xmfView.SaveData = function(inEle) {
	alert('inEle' + inEle)
	inEle.append('BLX.24', 'HL'); //模版分类/代号/编码
	//事件处理流程  ISHZT 0 已登记  1 待讨论  2 已处理  3 已确认
	inEle.append('BLX.46', 0);

	if (ISHZT == null) ISHZT = 0;
	if (($("#MmKSYJ").val().replace(/(\s*)/g, "") == "") && (($("#MmZKPJ").val().replace(/(\s*)/g, "") == ""))) {
		inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "0"; //上报中
	} else {
		if (FlagTL == 0) {
			if (($("#MmKSYJ").val().replace(/(\s*)/g, "") != "") && ($("#CbTL")[0].checked == true))
				inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "1"; //讨论分析中
			else
				inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = ISHZT;
		} else {
			inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "0";
		}

		if (FlagCL == 0) {
			if (($("#MmZKPJ").val().replace(/(\s*)/g, "") != "") && ($("#CbCL")[0].checked == true))
				inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "2"; //已处理
			else if (inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text == "")
				inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = ISHZT;
		} else {
			if (($("#EdtSHRBM").val() == "") || ($("#EdtSHSJ").val() == ""))
				inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = 0;
			else inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = 1; //从待讨论状态撤销到登记状态
		}

	}
	if ($("#CbQR")[0].checked == true) inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "3";


}

xmfView.FillOtherData = function(node) {
	ISHZT = node.selectSingleNode("P60000047").text;
	IBRLX = node.selectSingleNode("P60000013").text;
	alert('FillOtherData' + node)
	//提交勾选框处理
	$("#CbTL")[0].checked = false;
	$("#CbCL")[0].checked = false;
	if (node.selectSingleNode("P60000048").text != "") $("#CbTL")[0].checked = true;
	if (node.selectSingleNode("P60000163").text != "") $("#CbCL")[0].checked = true;
	if (ISHZT == "3") $("#CbQR")[0].checked = true;

}


xmfView.CheckData = function() {
	if ($("#EdtBRXM").val().replace(/(\s*)/g, "") == "") {
		alert("患者姓名不能为空！");
		return false;
	}

	//当前时间
	// var nowDat = new Date();
	// // 发生时间验证
	// if ($("#EdtFSSJ").val().replace(/(\s*)/g, "") == "") {
	// 	alert("不良事件发生时间不能为空！");
	// 	$("#EdtFSSJ").val("");
	// 	$("#EdtFSSJ").focus();
	// 	return false;
	// }
	// if ($("#EdtFSSJ").val().replace(/(\s*)/g, "") != "") {
	// 	var fsDate = new Date($("#EdtFSSJ").val().replaceAll("-", "/"));
	// 	if (fsDate.getTime() > nowDat.getTime()) {
	// 		alert("时间发生时间不可大于当前时间！");
	// 		$("#EdtFSSJ")[0].focus();
	// 		return false;
	// 	}
	// }


	// //事件发生经过
	// if ($("#MmFSJG").val().replace(/(\s*)/g, "") == "") {
	// 	alert("事件发生经过不能为空！");
	// 	$("#MmFSJG").focus();
	// 	return false;
	// }

	// if ((OprBLZH != "1") && ($("#CbTL")[0].checked == true) &&
	// 	($("#MmKNYS").val().replace(/(\s*)/g, "") == "")) {
	// 	alert("原因分析不能为空！");
	// 	$("#MmKNYS").focus();
	// 	return false;
	// }

	// if ((OprBLZH != "1") && ($("#CbTL")[0].checked == true) &&
	// 	($("#MmKSYJ").val().replace(/(\s*)/g, "") == "")) {
	// 	alert("防范措施不能为空！");
	// 	$("#MmKSYJ").focus();
	// 	return false;
	// }

	// //事件评价
	// if ((OprBLZH == "3") && ($("#CbCL")[0].checked == true) &&
	// 	($("#MmZKPJ").val().replace(/(\s*)/g, "") == "")) {
	// 	alert("护理部意见不能为空！");
	// 	$("#MmZKPJ").focus();
	// 	return false;
	// }


	// if ($("#CbQR")[0].checked == true) {
	// 	var Info = "";
	// 	if ($("#EdtSHRBM").val().replace(/(\s*)/g, "") == "") Info = "但 护士长 并未审核此事件";
	// 	if ($("#EdtSHRBM2").val().replace(/(\s*)/g, "") == "") Info += ((Info == "") ? "但" : "且") +
	// 		" 大科室护士长 并未审核此事件,\n";
	// 	Info += ((Info == "") ? "" : "") + "继续的话该事件信息将不得再进行修改删除等操作!";

	// 	if (!window.confirm("您选择了不良事件确认选项," + Info + "是否确定继续？")) {
	// 		$("#CbQR")[0].checked = false;
	// 		$("#EdtSHRBM3,#EdtSHR3,#EdtSHSJ3").val("");
	// 		return false;
	// 	}
	// }
	return true;
}



xmfView.PageLoad = function(XMLNode) {
	// CallMode 模式类型 修改-新增
	if (this.CallMode != "stView") {
		//根据分组号控制控件
		var LST = null;
		if (OprBLZH > 0) {
			switch (OprBLZH) {
				case "1":
					LST = ["MmKNYS", "MmKSYJ", "MmZKPJ", "CbTL", "BtnCXTL", "CbCL", "BtnCXCL", "CbQR"];
					break;
				case "2":
					LST = ["MmZKPJ", "CbCL", "BtnCXCL", "CbQR"];
					break;
				case "3":
					break;
				default:
					break;
			}
			if (LST != null)
				for (var i = 0; i < LST.length; i += 1) {
					$("#" + LST[i])[0].disabled = true;
				}
		}
		switch (ISHZT) {
			case "0":
				$("#BtnCXTL")[0].disabled = true;
				$("#BtnCXCL")[0].disabled = true;
				break;
			case "1":
				$("#CbTL")[0].disabled = true;
				$("#BtnCXCL")[0].disabled = true;
				break
			case "2":
				$("#CbTL")[0].disabled = true;
				$("#CbCL")[0].disabled = true;

				// $("#RdSBY")[0].disabled = true;
				// $("#RdSBN")[0].disabled = true;
				break;
			default:
				break;
		}
		if (this.CallMode == "stAdd") {
			document.getElementById("EdtBGKS").value = OprBQMC;
			document.getElementById("EdtBGKSBM").value = OprBQBM;
			document.getElementById("EdtBGSJ").value = NowM;
			document.getElementById("EdtBGRBM").value = OprGH;
			document.getElementById("EdtBGR").value = OprXM;
			$("#BtnCXTL")[0].disabled = true;
			$("#BtnCXCL")[0].disabled = true;
		}

	} else if (this.CallMode == "stView") {
		LST = ["CbTL", "BtnCXTL", "CbCL", "BtnCXCL", "CbQR", "BtnGLXX"];
		for (var i = 0; i < LST.length; i += 1) {
			$("#" + LST[i])[0].disabled = true;
		}
	}
}


function BtnGLXXClick(aObject, aEvent) {
	var Opr = new OperateDom();
	var Msg = Opr.append("ROOT", "MSG", "");
	var Info = Opr.append(Msg, "Info", "");
	var CZYinfo = Opr.append(Info, "CZYinfo", "");
	Opr.appendAttribute(CZYinfo, "CCZYGH", OprGH);
	Opr.appendAttribute(CZYinfo, "CCZY", OprXM);
	Opr.appendAttribute(CZYinfo, "CBLZH", OprBLZH);
	Opr.appendAttribute(CZYinfo, "CBQBM", OprBQBM);
	Opr.appendAttribute(CZYinfo, "CBQMC", OprBQMC);
	var node = PubFuns.showDialog("PubJavaScript/PubDialog.jsp?Tag=1&BRInfo=" + CBRInfo, Opr.toObj(), {
		width: "800px",
		height: "500px"
	});
	alert('node:' + node)
	if (node != null) {
		
		var LST = ["EdtBRXM", "EdtNL", "EdtXB", "EdtBH", "EdtBRH"];
		Clear(LST);
		var aa = ["BLX.3=CBRXM", "BLX.4=CXB", "BLX.6=CNL", "BLX.16=CLCZD", "BLX.0=CBH", "BLX.1=CBRH"];
		PubFuns.padData(aa, node);
	}

}

function Clear(LST) {
	if (LST != null) {
		for (var i = 0; i < LST.length; i += 1) document.getElementById(LST[i]).value = "";
	}
}

function CbTLClick(aObject, aEvent) {
	alert('CbTLClick')
	if ($("#CbTL")[0].checked == true) {
		$("#EdtSHRBM")[0].value = OprGH;
		$("#EdtSHR")[0].value = OprXM;
		$("#EdtSHSJ")[0].value = NowM;
	} else {
		var LST = ["EdtSHRBM", "EdtSHR", "EdtSHSJ"];
		for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
	}

}

function CbCLClick(aObject, aEvent) {
	alert('CbCLClick')
	if ($("#CbCL")[0].checked == true) {
		$("#EdtSHRBM2")[0].value = OprGH;
		$("#EdtSHR2")[0].value = OprXM;
		$("#EdtSHSJ2")[0].value = NowM;
	} else {
		var LST = ["EdtSHRBM2", "EdtSHR2", "EdtSHSJ2"];
		for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
	}
}


function BtnCXTLClick(aObject, aEvent) {
	alert('BtnCXTLClick')
	if (OprBLZH != "1") {
		if (ISHZT == "1") {
			if (window.confirm("确定要撤销吗？（*确认撤销后请先保存再进行其他操作！)")) {
				var LST = ["EdtSHRBM", "EdtSHR", "EdtSHSJ", "MmKSYJ", "MmKNYS"];
				for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
				$("#CbTL")[0].checked = false;
				FlagTL = 1;
			}
		} else if (ISHZT == "2") alert("请先撤销处理状态再进行此项操作，若确定已撤销处理状态请先保存后重试！");
	} else alert("抱歉，你没有权限进行该操作，请联系上级操作员！");
}

function BtnCXCLClick(aObject, aEvent) {
	alert('BtnCXCLClick')
	if (OprBLZH == "3") {
		if (window.confirm("确定要撤销吗？（*确认撤销后请先保存再进行其他操作！)")) {
			var LST1 = ["EdtSHRBM2", "EdtSHR2", "EdtSHSJ2", "MmZKPJ"];
			for (var i = 0; i < LST1.length; i += 1) $("#" + LST1[i])[0].value = "";
			$("#CbCL")[0].checked = false;
			FlagTL = 1;
			FlagCL = 1;
		}
	} else alert("抱歉，你没有权限进行该操作，请联系上级操作员！");
}

function CbQRClick(aObject, aEvent) {
	alert('CbQRClick')
	if ($("#CbQR")[0].checked == true) {
		$("#EdtSHRBM3")[0].value = OprGH;
		$("#EdtSHR3")[0].value = OprXM;
		$("#EdtSHSJ3")[0].value = NowM;
	} else {
		var LST = ["EdtSHRBM3", "EdtSHR3", "EdtSHSJ3"];
		for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
	}
}


function PubControl(bol, id) {
	if (bol) {
		document.getElementById(id).disabled = false;
		document.getElementById(id).select();
	} else {
		document.getElementById(id).disabled = true;
		document.getElementById(id).value = "";
	}
}