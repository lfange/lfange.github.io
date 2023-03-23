include(baseModule + "EpBox/EpBox.js");
include(baseDir + "getPinYin.js");
var FlagTL = 0;
var FlagCL = 0;
var ISHZT = null;
var IBRLX = null;

xmfView.SaveData = function (inEle) {
  inEle.append('BLX.24', 'HL');
  inEle.append('BLX.25', '0');
  //之前意识其他
  // if ($("#Radio_11").attr("checked")==true) {
  //     inEle.toObj().documentElement.getElementsByTagName("BLX.125")[0].text = $("#EdtZQYSQT").val();
  // };
  //之后意识其他
  // if ($("#Radio_12").attr("checked")==true) {
  //     inEle.toObj().documentElement.getElementsByTagName("BLX.126")[0].text = $("#EdtZHYSQT").val();
  // };
  //学历其他
  if ($("#Radio_23").attr("checked") == true) {
    inEle.toObj().documentElement.getElementsByTagName("BLX.144")[0].text = $("#EdtXL").val();
  };
  //职称其他
  if ($("#Radio_28").attr("checked") == true) {
    inEle.toObj().documentElement.getElementsByTagName("BLX.57")[0].text = $("#EdtZC").val();
  };
  //造成影响其他
  // if ($("#Radio_57").attr("checked")==true) {
  //     inEle.toObj().documentElement.getElementsByTagName("BLX.154")[0].text = $("#EdtZCYX").val();
  // };

  //事件处理流程  ISHZT 0 已登记  1 待讨论  2 已处理  3 已确认
  inEle.append('BLX.46', 0);
  if (ISHZT == null) ISHZT = 0;
  if (($("#MmKSFX").val().replace(/(\s*)/g, "") == "") && (($("#MmHLBFX").val().replace(/(\s*)/g, "") == ""))) {
    inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "0"; //上报中
  } else {
    if (FlagTL == 0) {
      if (($("#MmKSFX").val().replace(/(\s*)/g, "") != "") && ($("#CbTL")[0].checked == true))
        inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "1";  //讨论分析中
      else
        inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = ISHZT;
    } else {
      inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "0";
    }

    if (FlagCL == 0) {
      if (($("#MmHLBFX").val().replace(/(\s*)/g, "") != "") && ($("#CbCL")[0].checked == true))
        inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "2";  //已处理
      else if (inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text == "")
        inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = ISHZT;
    } else {
      if (($("#EdtSHRBM2").val() == "") || ($("#EdtSHSJ2").val() == ""))
        inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = 0;
      else inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = 1; //从待讨论状态撤销到登记状态
    }

  }
  if ($("#CbQR")[0].checked == true) inEle.toObj().documentElement.getElementsByTagName("BLX.46")[0].text = "3";

  var node = document.getElementsByName("P60000038");
  var CSJLXMC = "";
  for (var i = 0; i < node.length; i += 1) {
    if (node[i].checked) {
      CSJLXMC += (CSJLXMC == "" ? "" : "|") + node[i].value2;
    }
  }
  inEle.append("BLX.38", "");
  inEle.element("BLX.38").text = CSJLXMC;

  // if (document.getElementById("CheckBox_21").checked) {
  //     inEle.toObj().documentElement.getElementsByTagName("BLX.153")[0].text 
  //         = document.getElementById("EdtQTSJLX").value;
  // }
}  //var Tag = 0;

xmfView.FillOtherData = function (node) {
  ISHZT = node.selectSingleNode("P60000047").text;
  // var JSZQ = ["Radio_3","Radio_4","Radio_5","Radio_7","Radio_11"];
  // var JSZH = ["Radio_9","Radio_10","Radio_6","Radio_8","Radio_12"];
  var XL = ["Radio_20", "Radio_21", "Radio_22", "Radio_23"];
  var ZC = ["Radio_24", "Radio_25", "Radio_26", "Radio_27", "Radio_28"];
  // var ZCYX = ["Radio_54","Radio_55","Radio_56","Radio_57"];

  //BLX.125 CZQJSZT
  // for (var i = 0; i < JSZQ.length; i += 1 ) {
  //     if (node.selectSingleNode("P60000126").text=="") $("#"+JSZQ[i])[0].checked = false
  //     else $("#"+JSZQ[i])[0].checked = true;
  //     if ($("#"+JSZQ[i]).val()==node.selectSingleNode("P60000126").text) {
  //         break;
  //     } 
  // }
  // if ($("#Radio_11")[0].checked ==true) $("#EdtZQYSQT").val(node.selectSingleNode("P60000126").text);

  //BLX.126 CZHJSZT
  // for (var i = 0; i < JSZH.length; i += 1 ) {
  //     if (node.selectSingleNode("P60000127").text=="") $("#"+JSZH[i])[0].checked = false
  //     else $("#"+JSZH[i])[0].checked = true;
  //     if ($("#"+JSZH[i]).val()==node.selectSingleNode("P60000127").text) {
  //         break;
  //     } 
  // }
  // if ($("#Radio_12")[0].checked ==true) $("#EdtZHYSQT").val(node.selectSingleNode("P60000127").text);

  //BLX.144 CDSRXL1
  for (var i = 0; i < XL.length; i += 1) {
    if (node.selectSingleNode("P60000145").text == "") $("#" + XL[i])[0].checked = false
    else $("#" + XL[i])[0].checked = true;
    if ($("#" + XL[i]).val() == node.selectSingleNode("P60000145").text) {
      break;
    }
  }
  if ($("#Radio_23")[0].checked == true) $("#EdtXL").val(node.selectSingleNode("P60000145").text);

  //BLX.57 CDSRZC1
  for (var i = 0; i < ZC.length; i += 1) {
    if (node.selectSingleNode("P60000058").text == "") $("#" + ZC[i])[0].checked = false
    else $("#" + ZC[i])[0].checked = true;
    if ($("#" + ZC[i]).val() == node.selectSingleNode("P60000058").text) {
      break;
    }
  }
  if ($("#Radio_28")[0].checked == true) $("#EdtZC").val(node.selectSingleNode("P60000058").text);

  //BLX.154 CZCYX
  // for (var i = 0; i < ZCYX.length; i += 1 ) {
  //     if (node.selectSingleNode("P60000155").text=="") $("#"+ZCYX[i])[0].checked = false
  //     else $("#"+ZCYX[i])[0].checked = true;
  //     if ($("#"+ZCYX[i]).val()==node.selectSingleNode("P60000155").text) {
  //         break;
  //     } 
  // }
  // if ($("#Radio_57")[0].checked ==true) $("#EdtZCYX").val(node.selectSingleNode("P60000155").text);

  //是否有伤害处理
  // if (((node.selectSingleNode("P60000156").text).replace(/(\s*)/g,"")!="") ||
  //     (((node.selectSingleNode("P60000109").text).replace(/(\s*)/g,""))!=""))
  //     $("#Radio_44")[0].checked =true 
  // else {
  //     $("#Radio_45")[0].checked = true;
  // }
  // if (this.CallMode != "stView") {
  //     Radio_44Click($("#Radio_44")[0],null);
  // } else {
  //     document.getElementById("Radio_44").disabled=true;
  //     document.getElementById("Radio_45").disabled=true;
  // }

  if (this.CallMode == "stView") {
    var LST_SJLX = ["CheckBox_1", "CheckBox_6", "CheckBox_17"];
    //,"Cb46","Cb47","Cb48","Cb49","Cb50","Cb51","Cb52","Cb53",
    //"Cb29","Cb30","Cb31","Cb32","Cb33","Cb34","Cb35","Cb36","Cb37"
    SetSHDs(LST_SJLX, false);
  }

  IBRLX = node.selectSingleNode("P60000013").text;
  switch (IBRLX) {
    case "1":
      $("#EdtBRLX")[0].value = "住院";
      break;
    case "2":
      $("#EdtBRLX")[0].value = "门诊";
      break;
    case "3":
      $("#EdtBRLX")[0].value = "出院";
      break;
    default:
      $("#EdtBRLX")[0].value = "";
      break;
  }

  //提交勾选框处理
  $("#CbTL")[0].checked = false;
  $("#CbCL")[0].checked = false;
  if (node.selectSingleNode("P60000163").text != "") $("#CbTL")[0].checked = true; //2级审核人编码
  if (node.selectSingleNode("P60000166").text != "") {
    $("#CbCL")[0].checked = true; //2级审核人编码
    // var LST = ["Radio_59","Radio_60","Radio_61","Radio_62"];
    // if ($("#CbCL")[0].checked==true) {
    //     for (var i = 0; i < LST.length; i += 1 ) {
    //         $("#" + LST[i])[0].disabled = true;
    //     }
    // } else {
    //     for (var i = 0; i < LST.length; i += 1 ) {
    //         $("#" + LST[i])[0].disabled = false;
    //     }
    // }
  }
  if (ISHZT == "3") $("#CbQR")[0].checked = true;
}
xmfView.CheckData = function () {
  //当前时间
  var nowDat = new Date();
  if ((this.CallMode == "stAdd") || (ISHZT == null)) ISHZT = 0;
  if ($("#EdtSBKS").val().replace(/(\s*)/g, "") == "") {
    alert("上报科室不能为空！");
    $("#EdtSBKS").val("");
    $("#EdtSBKS").focus();
    return false;
  }

  if ($("#EdtSBKS").val().replace(/(\s*)/g, "") == "") {
    alert("填报日期不能为空！");
    $("#EdtSBKS").val("");
    $("#EdtSBKS").focus();
    return false;
  }

  if ($("#EdtBRXM").val().replace(/(\s*)/g, "") == "") {
    alert("姓名不能为空！");
    $("#EdtBRXM").val("");
    $("#EdtBRXM").focus();
    return false;
  }

  // if (($("#Radio_11")[0].checked ==true)&&($("#EdtZQYSQT").val().replace(/(\s*)/g,"")=="")) {
  //     alert("请输入事件前病人意识状态！");
  //     $("#EdtZQYSQT").val("");
  //     $("#EdtZQYSQT").focus();
  //     return false; 
  // }

  // if (($("#Radio_12")[0].checked ==true)&&($("#EdtZHYSQT").val().replace(/(\s*)/g,"")=="")) {
  //     alert("请输入事件后病人意识状态！");
  //     $("#EdtZHYSQT").val("");
  //     $("#EdtZHYSQT").focus();
  //     return false; 
  // }

  if (($("#Radio_23")[0].checked == true) && ($("#EdtXL").val().replace(/(\s*)/g, "") == "")) {
    alert("当事人学历不能为空！");
    $("#EdtXL").val("");
    $("#EdtXL").focus();
    return false;
  }

  if (($("#Radio_28")[0].checked == true) && ($("#EdtZC").val().replace(/(\s*)/g, "") == "")) {
    alert("当事人职称不能为空！");
    $("#EdtZC").val("");
    $("#EdtZC").focus();
    return false;
  }

  {   //事件类型check
    //用药错误
    if ($("#CheckBox_1")[0].checked == true) {
      var Byy = false;
      var lstyy = ["CheckBox_2", "CheckBox_3", "CheckBox_4", "CheckBox_5"];
      for (var i = 0; i < lstyy.length; i += 1) {
        if ($("#" + lstyy[i])[0].checked == true) {
          Byy = true;
          break;
        }
      }
      if (!Byy) {
        alert("用药错误事件类别至少选择一项！");
        $("#CheckBox_2").focus();
        return false;
      }
    }
    //标本错误
    if ($("#CheckBox_6")[0].checked == true) {
      var Bbb = false;
      var lstbb = ["CheckBox_7", "CheckBox_8", "CheckBox_9", "CheckBox_10", "CheckBox_11"];
      for (var i = 0; i < lstbb.length; i += 1) {
        if ($("#" + lstbb[i])[0].checked == true) {
          Bbb = true;
          break;
        }
      }
      if (!Bbb) {
        alert("标本错误事件类别至少选择一项！");
        $("#CheckBox_7").focus();
        return false;
      }
    }
    //患者行为
    if ($("#CheckBox_17")[0].checked == true) {
      var Bxw = false;
      var lstxw = ["CheckBox_18", "CheckBox_19", "CheckBox_20"];
      for (var i = 0; i < lstxw.length; i += 1) {
        if ($("#" + lstxw[i])[0].checked == true) {
          Bxw = true;
          break;
        }
      }
      if (!Bxw) {
        alert("患者行为事件类别至少选择一项！");
        $("#CheckBox_18").focus();
        return false;
      }
    }
    //一个都没选的
    var LST = ["CheckBox_1", "CheckBox_6", "CheckBox_12", "CheckBox_13", "CheckBox_14",
      "CheckBox_15", "CheckBox_16", "CheckBox_17", "CheckBox_21", "CheckBox_22", "CheckBox_23", "CheckBox_24", "CheckBox_25", "CheckBox_26", "CheckBox_27",
      'CheckBox_30', 'CheckBox_28', 'CheckBox_31', 'CheckBox_32', 'CheckBox_33', 'CheckBox_34', 'CheckBox_35', 'CheckBox_36', 'CheckBox_37', 'CheckBox_38', 'CheckBox_39'
    ];
    var TagSJ = 0;
    for (var i = 0; i < LST.length; i += 1) {
      if (document.getElementById(LST[i]).checked == true) {
        TagSJ = 1;
        break;
      }
    }
    if (TagSJ == 0) {
      alert("事件类别至少选择一项！");
      $("#CheckBox_1").focus();
      return false;
    }

    if (($("#CheckBox_21")[0].checked == true) && ($("#EdtQTSJLX").val().replace(/(\s*)/g, "") == "")) {
      alert("其他事件类别不能为空！");
      $("#EdtQTSJLX").val("");
      $("#EdtQTSJLX").focus();
      return false;
    }
  }

  {   //通知人员check
    var LST = ["Cb29", "Cb30", "Cb31", "Cb32", "Cb33", "Cb34", "Cb35", "Cb36", "Cb37"];
    var TagTZ = 0;
    for (var i = 0; i < LST.length; i += 1) {
      if (document.getElementById(LST[i]).checked == true) {
        TagTZ = 1;
        break;
      }
    }
    if (TagTZ == 0) {
      alert("立即通知人员至少选择一项！");
      $("#Cb29").focus();
      return false;
    }
  }
  if (($("#Cb37")[0].checked == true) && ($("#EdtTZRYQT").val().replace(/(\s*)/g, "") == "")) {
    alert("其他立即通知人员不能为空！");
    $("#EdtTZRYQT").val("");
    $("#EdtTZRYQT").focus();
    return false;
  }

  //伤害check
  // if ($("#Radio_44")[0].checked == true) {
  //     var LST = ["Cb46","Cb47","Cb48","Cb49","Cb50","Cb51","Cb52","Cb53"];
  //     var TagSH = 0;
  //     for (var i=0;i<LST.length;i+=1) {
  //         if (document.getElementById(LST[i]).checked == true) {
  //             TagSH = 1;
  //             break;
  //         }
  //     }
  //     if (TagSH == 0) {
  //         alert("请选择造成伤害！");
  //         $("#Cb46").focus();
  //         return false;             
  //     } 
  // }
  // if (($("#Cb50")[0].checked ==true)&&($("#EdtFYJSHQT").val().replace(/(\s*)/g,"")=="")) {
  //     alert("其他非永久伤害不能为空！");
  //     $("#EdtFYJSHQT").val("");
  //     $("#EdtFYJSHQT").focus();
  //     return false; 
  // }
  // if (($("#Cb53")[0].checked ==true)&&($("#EdtYJSHQT").val().replace(/(\s*)/g,"")=="")) {
  //     alert("其他永久伤害不能为空！");
  //     $("#EdtYJSHQT").val("");
  //     $("#EdtYJSHQT").focus();
  //     return false; 
  // }

  // if (($("#Radio_57")[0].checked ==true)&&($("#EdtZCYX").val().replace(/(\s*)/g,"")=="")) {
  //     alert("对病人造成影响其他不能为空！");
  //     $("#EdtZCYX").val("");
  //     $("#EdtZCYX").focus();
  //     return false; 
  // }

  // if (($("#MmFSYY").val().replace(/(\s*)/g,"")=="")) {
  //     alert("事件原因分析不能为空！");
  //     $("#MmFSYY").val("");
  //     $("#MmFSYY").focus();
  //     return false; 
  // }


  if ($("#CbTL")[0].checked == true) {

    if ($("#MmKSFX").val().replace(/(\s*)/g, "") == "") {
      if ((ISHZT > 0) || ($("#CbTL")[0].checked == true)) {
        alert("改进措施不能为空！");
        $("#MmKSFX").val("");
        $("#MmKSFX").focus();
        return false;
      }
    }

    var LST = ["Radio_1", "Radio_2", "Radio_3", "Radio_4", "Radio_5", "Radio_6", "Radio_7"];
    var Tag = 0;
    for (var i = 0; i < LST.length; i += 1) {
      if ($("#" + LST[i])[0].checked == true) {
        Tag = 0;
        break;
      }
      Tag = 1;
    }
    if (Tag == 1) {
      alert("请选择事件等级！");
      $("#Radio_1").focus();
      return false;
    }
  }

  if ((OprBLZH == "3") && (FlagCL == 0)) {
    if ($("#MmHLBFX").val().replace(/(\s*)/g, "") == "") {
      if ((ISHZT > 1) || ($("#CbCL")[0].checked == true)) {
        alert("事件讨论分析不能为空！");
        $("#MmHLBFX").val("");
        $("#MmHLBFX").focus();
        return false;
      }
    }
    // if ((ISHZT>1)||($("#CbCL")[0].checked==true)) {
    //     var LST = ["Radio_59","Radio_60","Radio_61","Radio_62"];
    //     var Tag = 0;
    //     for (var i = 0; i < LST.length; i += 1 ) {
    //         if ($("#" + LST[i])[0].checked == true) {
    //             Tag = 0;
    //             break;
    //         }
    //         Tag = 1;
    //     }
    //     if (Tag==1) {
    //         alert("请选择不良事件等级！");
    //         $("#Radio_59").focus();
    //         return false;
    //     }
    // }
  }

  if ($("#CbQR")[0].checked == true) {
    var Info = "";
    if ($("#EdtSHRBM2").val().replace(/(\s*)/g, "") == "") Info = "但护士长并未审核此事件";
    if ($("#EdtSHRBM3").val().replace(/(\s*)/g, "") == "") Info += ((Info == "") ? "但" : "且") + "护理部并未审核此事件,\n";
    Info += ((Info == "") ? "" : "") + "继续的话该事件信息将不得再进行修改删除等操作!";

    if (!window.confirm("您选择了不良事件确认选项," + Info + "是否确定继续？")) {
      $("#CbQR")[0].checked = false;
      return false;
    }
  }
  return true;
}

// xmfView.CheckObj = function(inEle,NewEle,OldEle) { //判断上报信息是否修改
//     var LST = ["BLX.3","BLX.1","BLX.125","BLX.126","BLX.137","BLX.140","BLX.142",
//         "BLX.143","BLX.58","BLX.59","BLX.144","BLX.57","BLX.37","BLX.153","BLX.29",
//         "BLX.33","BLX.42","BLX.192","BLX.133","BLX.35","BLX.138","BLX.139","BLX.155",
//         "BLX.194","BLX.108","BLX.193","BLX.154","BLX.43"];
//     for (var i = 0; i < LST.length; i += 1 ) {
//         if ((OldEle.getElementsByTagName(LST[i])[0].text)!=(NewEle.getElementsByTagName(LST[i])[0].text)){
//             inEle.toObj().documentElement.getElementsByTagName("BLX.195")[0].text = OprGH;
//             inEle.toObj().documentElement.getElementsByTagName("BLX.196")[0].text = OprXM;
//             inEle.toObj().documentElement.getElementsByTagName("BLX.238")[0].text = NowM;
//             break;
//         };
//     };    
// }

xmfView.PageLoad = function (XMLNode) {
  if (this.CallMode != "stView") {
    //根据分组号控制控件
    if (OprBLZH > 0) {
      switch (OprBLZH) {
        case "1":
          var LST = ["CbTL", "CbCL", "Radio_1", "Radio_2", "Radio_3", "Radio_4", "Radio_5", "Radio_6", "Radio_7"]//"MmKSFX","MmHLBFX",
          for (var i = 0; i < LST.length; i += 1) {
            $("#" + LST[i])[0].disabled = true;
          }
          $("#MmKSFX")[0].readOnly = true;
          $("#MmHLBFX")[0].readOnly = true;
          break;
        case "2":
          $("#CbCL")[0].disabled = true;
          $("#MmHLBFX")[0].readOnly = true;
          var LST1 = ["Radio_1", "Radio_2", "Radio_3", "Radio_4", "Radio_5", "Radio_6", "Radio_7"];
          if ((ISHZT == "1") && ($("#CbTL")[0].checked != true)) {
            for (var i = 0; i < LST1.length; i += 1) {
              $("#" + LST1[i])[0].disabled = false;
            }
          } else {
            for (var i = 0; i < LST1.length; i += 1) {
              $("#" + LST1[i])[0].disabled = true;
            }
          }
          break;
        case "3":
          var LST = ["Radio_1", "Radio_2", "Radio_3", "Radio_4", "Radio_5", "Radio_6", "Radio_7"];
          for (var i = 0; i < LST.length; i += 1) {
            $("#" + LST[i])[0].disabled = true;
          }
          break;
        default:
          break;
      }
    }

    switch (ISHZT) {
      case "0":
        //$("#CbTL")[0].disabled = true;
        $("#BtnCXTL")[0].disabled = true;
        //$("#CbCL")[0].disabled = true;
        $("#BtnCXCL")[0].disabled = true;
        break;
      case "1":
        $("#CbTL")[0].disabled = true;
        $("#BtnCXCL")[0].disabled = true;
        break
      case "2":
        $("#CbTL")[0].disabled = true;
        $("#CbCL")[0].disabled = true;
        break;
      default:
        break;
    }
  }
  if (this.CallMode == "stAdd") {
    document.getElementById("EdtSBSJ").value = DATE;
    document.getElementById("DateTime_2").value = NowM;
    document.getElementById("EdtBGRBM").value = OprGH;
    document.getElementById("EdtBGRXM").value = OprXM;

    document.getElementById("EdtSBKS").value = OprBQMC;
    document.getElementById("EdtKSBM").value = OprBQBM;
    $("#BtnCXTL")[0].disabled = true;
    $("#BtnCXCL")[0].disabled = true;
  }
  if (this.CallMode == "stView") {
    $("#CbTL")[0].disabled = true;
    $("#BtnCXTL")[0].disabled = true;
    $("#CbCL")[0].disabled = true;
    $("#BtnCXCL")[0].disabled = true;
    $("#BtnXX")[0].disabled = true;
  }
  if ((OprBLZH == "3") && (this.CallMode != "stView")) $("#CbQR")[0].disabled = false;
  else $("#CbQR")[0].disabled = true;
  switch (IBRLX) {
    case ("1") || ("3"):
      $("#LbZYH").show();
      $("#LbMZH").hide();
      $("#LbRYSJ").show();
      $("#LbGHSJ").hide();
      break;
    case "2":
      $("#LbZYH").hide();
      $("#LbMZH").show();
      $("#LbRYSJ").hide();
      $("#LbGHSJ").show();
      break;
    default:
      $("#LbZYH").show();
      $("#LbMZH").hide();
      $("#LbRYSJ").show();
      $("#LbGHSJ").hide();
      break;
  }
  //撤销后才能进行修改
  if ($("#CbTL")[0].checked == true) $("#MmKSFX")[0].readOnly = true;
  if ($("#CbCL")[0].checked == true) $("#MmHLBFX")[0].readOnly = true;
  //用药错误
  var lstyy = ["CheckBox_2", "CheckBox_3", "CheckBox_4", "CheckBox_5"];
  for (var i = 0; i < lstyy.length; i += 1) {
    if ($("#" + lstyy[i])[0].checked == true) {
      $("#CheckBox_1")[0].checked = true;
      break;
    }
  }
  for (var i = 0; i < lstyy.length; i += 1)
    if (this.CallMode != "stView")
      $("#" + lstyy[i])[0].disabled = !($("#CheckBox_1")[0].checked);
  //标本错误
  var lstbb = ["CheckBox_7", "CheckBox_8", "CheckBox_9", "CheckBox_10", "CheckBox_11"];
  for (var i = 0; i < lstbb.length; i += 1) {
    if ($("#" + lstbb[i])[0].checked == true) {
      $("#CheckBox_6")[0].checked = true;
      break;
    }
  }
  for (var i = 0; i < lstbb.length; i += 1)
    if (this.CallMode != "stView")
      $("#" + lstbb[i])[0].disabled = !($("#CheckBox_6")[0].checked);
  //患者行为
  var lstxw = ["CheckBox_18", "CheckBox_19", "CheckBox_20"];
  for (var i = 0; i < lstxw.length; i += 1) {
    if ($("#" + lstxw[i])[0].checked == true) {
      $("#CheckBox_17")[0].checked = true;
      break;
    }
  }
  for (var i = 0; i < lstxw.length; i += 1)
    if (this.CallMode != "stView")
      $("#" + lstxw[i])[0].disabled = !($("#CheckBox_17")[0].checked);
  //用药错误其他，标本错误其他
  if (this.CallMode != "stView") {
    $("#EdtYYCWQT")[0].readOnly = !($("#CheckBox_5")[0].checked);
    $("#EdtBBCWQT")[0].readOnly = !($("#CheckBox_11")[0].checked);
  }
}

function EdtSBKSFocus (aObject, aEvent) {
  getEpBox(aObject, { epName: 'GZBM', epNext: '', epWidth: 300, epJson: [{ id: 'EdtKSBM', value: 1 }, { id: 'EdtSBKS', value: 2 }], defAttr: 'CBMBM' });
}

function EdtFSDDFocus (aObject, aEvent) {
  getEpBox(aObject, { epName: 'TBZDBLSJFSDD', defAttr: "CDDMC", epJson: [{ id: 'EdtFSDD', value: 1 }] });
}

// function Radio_3Click(aObject,aEvent){
//     this.PubControl(!aObject.checked,"EdtZQYSQT");
// }

// function Radio_9Click(aObject,aEvent){
//     this.PubControl(!aObject.checked,"EdtZHYSQT");
// }

// function Radio_11Click(aObject,aEvent){
//     this.PubControl(aObject.checked,"EdtZQYSQT");
// }

// function Radio_12Click(aObject,aEvent){
//     this.PubControl(aObject.checked,"EdtZHYSQT");
// }

function Radio_20Click (aObject, aEvent) {
  this.PubControl(!aObject.checked, "EdtXL");
}

function Radio_23Click (aObject, aEvent) {
  this.PubControl(aObject.checked, "EdtXL");
}

function Radio_24Click (aObject, aEvent) {
  this.PubControl(!aObject.checked, "EdtZC");
}

function Radio_28Click (aObject, aEvent) {
  this.PubControl(aObject.checked, "EdtZC");
}

function CheckBox_21Click (aObject, aEvent) {
  this.PubControl(aObject.checked, "EdtQTSJLX");
}

function Cb37Click (aObject, aEvent) {
  this.PubControl(aObject.checked, "EdtTZRYQT");
}

// function Cb50Click(aObject,aEvent){
//     this.PubControl(aObject.checked,"EdtFYJSHQT");
// }

// function Cb53Click(aObject,aEvent){
//     this.PubControl(aObject.checked,"EdtYJSHQT");
// }

// function Radio_54Click(aObject,aEvent){
//     this.PubControl(!aObject.checked,"EdtZCYX");
// }

// function Radio_57Click(aObject,aEvent){
//     this.PubControl(aObject.checked,"EdtZCYX");
// }

// function Radio_44Click(aObject,aEvent){
//     var LST = ["Cb46","Cb47","Cb48","Cb49","Cb50","Cb51","Cb52","Cb53","EdtFYJSHQT","EdtYJSHQT"];
//     this.SetSHDs(LST,$("#Radio_44")[0].checked);
// }

function CheckBox_5Click (aObject, aEvent) {
  if ($("#CheckBox_5")[0].checked == true) {
    $("#EdtYYCWQT")[0].disabled = false;
    $("#EdtYYCWQT").focus();
  } else {
    $("#EdtYYCWQT")[0].disabled = true;
    $("#EdtYYCWQT")[0].value = "";
  }
}

function CheckBox_11Click (aObject, aEvent) {
  if ($("#CheckBox_11")[0].checked == true) {
    $("#EdtBBCWQT")[0].disabled = false;
    $("#EdtBBCWQT").focus();
  } else {
    $("#EdtBBCWQT")[0].disabled = true;
    $("#EdtBBCWQT")[0].value = "";
  }
}

function BtnCXTLClick (aObject, aEvent) {
  if (OprBLZH != "1") {
    if (ISHZT == "1") {
      if (window.confirm("确定要撤销吗？（*确认撤销后请先保存再进行其他操作！)")) {
        var LST = ["EdtSHRBM2", "EdtSHR2", "EdtSHSJ2"];
        for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
        $("#CbTL")[0].checked = false;
        FlagTL = 1;
      }
    } else if (ISHZT == "2") alert("请先撤销处理状态在进行此项操作！");
  } else alert("抱歉，你没有权限进行该操作，请联系上级操作员！");
}
function BtnCXCLClick (aObject, aEvent) {
  if (OprBLZH == "3") {
    if (window.confirm("确定要撤销吗？（*确认撤销后请先保存再进行其他操作！)")) {
      // var LST = ["Radio_59","Radio_60","Radio_61","Radio_62"];
      // for (var i = 0; i < LST.length; i += 1 ) $("#" + LST[i])[0].checked = false;
      var LST1 = ["EdtSHRBM3", "EdtSHR3", "EdtSHSJ3"];
      for (var i = 0; i < LST1.length; i += 1) $("#" + LST1[i])[0].value = "";
      $("#CbCL")[0].checked = false;
      FlagTL = 1;
      FlagCL = 1;

      // var LST = ["Radio_59","Radio_60","Radio_61","Radio_62"];
      // if ($("#CbCL")[0].checked==true) {
      //     for (var i = 0; i < LST.length; i += 1 ) {
      //         $("#" + LST[i])[0].disabled = false;
      //     }
      // } else {
      //     for (var i = 0; i < LST.length; i += 1 ) {
      //         $("#" + LST[i])[0].disabled = true;
      //         $("#" + LST[i])[0].checked = false;
      //     }
      // }
    }
  } else alert("抱歉，你没有权限进行该操作，请联系上级操作员！");
}

function CbTLClick (aObject, aEvent) {
  var LST1 = ["Radio_1", "Radio_2", "Radio_3", "Radio_4", "Radio_5", "Radio_6", "Radio_7"];
  if ($("#CbTL")[0].checked == true) {
    for (var i = 0; i < LST1.length; i += 1) {
      $("#" + LST1[i])[0].disabled = false;
    }
  } else {
    for (var i = 0; i < LST1.length; i += 1) {
      $("#" + LST1[i])[0].disabled = true;
      $("#" + LST1[i])[0].checked = false;
    }
  }

  if ($("#CbTL")[0].checked == true) {
    $("#EdtSHRBM2")[0].value = OprGH;
    $("#EdtSHR2")[0].value = OprXM;
    $("#EdtSHSJ2")[0].value = NowM;
  } else {
    var LST = ["EdtSHRBM2", "EdtSHR2", "EdtSHSJ2"];
    for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
  }
}

function CbCLClick (aObject, aEvent) {
  // var LST = ["Radio_59","Radio_60","Radio_61","Radio_62"];
  // if ($("#CbCL")[0].checked==true) {
  //     for (var i = 0; i < LST.length; i += 1 ) {
  //         $("#" + LST[i])[0].disabled = false;
  //     }
  // } else {
  //     for (var i = 0; i < LST.length; i += 1 ) {
  //         $("#" + LST[i])[0].disabled = true;
  //         $("#" + LST[i])[0].checked = false;
  //     }
  // }

  if ($("#CbCL")[0].checked == true) {
    $("#EdtSHRBM3")[0].value = OprGH;
    $("#EdtSHR3")[0].value = OprXM;
    $("#EdtSHSJ3")[0].value = NowM;
  }
  else {
    var LST = ["EdtSHRBM3", "EdtSHR3", "EdtSHSJ3"];
    for (var i = 0; i < LST.length; i += 1) $("#" + LST[i])[0].value = "";
  }
}

function DateTime_2Change (aObject, aEvent) {
  if ($("#DateTime_2")[0].value > NowM.toLocaleString()) {
    $("#DateTime_2")[0].value = NowM
  }
}
function BtnXXClick (aObject, aEvent) {
  var Opr = new OperateDom();
  var Msg = Opr.append("ROOT", "MSG", "");
  var Info = Opr.append(Msg, "Info", "");
  var CZYinfo = Opr.append(Info, "CZYinfo", "");
  Opr.appendAttribute(CZYinfo, "CCZYGH", OprGH);
  Opr.appendAttribute(CZYinfo, "CCZY", OprXM);
  Opr.appendAttribute(CZYinfo, "CBLZH", OprBLZH);
  Opr.appendAttribute(CZYinfo, "CBQBM", OprBQBM);
  Opr.appendAttribute(CZYinfo, "CBQMC", OprBQMC);

  var node = PubFuns.showDialog("PubJavaScript/PubDialog.jsp?Tag=1&BRInfo=" + CBRInfo, Opr.toObj(), { width: "800px", height: "500px" });
  if (node != null) {
    var LST = ["EdtBRXM", "EdtNL", "EdtXB", "EdtCWH", "EdtBRLX", "Edit_1", "EdtZYH", "EdtRYSJ", "EdtLCZD"];
    Clear(LST);
    var aa = ["BLX.1=CBRH", "BLX.2=CCWH", "BLX.3=CBRXM", "BLX.4=CXB", "BLX.6=CNL", "BLX.12=IBRLX", "BLX.13=DRYRQ", "BLX.16=CLCZD"]
    PubFuns.padData(aa, node);
    var IBRLX = node.getAttribute("IBRLX");
    switch (IBRLX) {
      case ("1"):
        $("#LbZYH").show();
        $("#LbMZH").hide();
        $("#LbRYSJ").show();
        $("#LbGHSJ").hide();
        $("#EdtBRLX")[0].value = "住院";
        break;
      case "2":
        $("#LbZYH").hide();
        $("#LbMZH").show();
        $("#LbRYSJ").hide();
        $("#LbGHSJ").show();
        $("#EdtBRLX")[0].value = "门诊";
        break;
      case ("3"):
        $("#LbZYH").show();
        $("#LbMZH").hide();
        $("#LbRYSJ").show();
        $("#LbGHSJ").hide();
        $("#EdtBRLX")[0].value = "出院";
        break;
      default:
        $("#EdtBRLX")[0].value = "";
        break;
    }
  }
}

function CheckBox_1Click (aObject, aEvent) {
  if ($("#CheckBox_1")[0].checked == true) {
    $("#CheckBox_2")[0].disabled = false;
    $("#CheckBox_3")[0].disabled = false;
    $("#CheckBox_4")[0].disabled = false;
    $("#CheckBox_5")[0].disabled = false;
  } else {
    $("#CheckBox_2")[0].disabled = true;
    $("#CheckBox_3")[0].disabled = true;
    $("#CheckBox_4")[0].disabled = true;
    $("#CheckBox_5")[0].disabled = true;

    $("#CheckBox_2")[0].checked = false;
    $("#CheckBox_3")[0].checked = false;
    $("#CheckBox_4")[0].checked = false;
    $("#CheckBox_5")[0].checked = false;
    $("#EdtYYCWQT")[0].readOnly = true;
    $("#EdtYYCWQT")[0].value = "";
  }
}

function CheckBox_6Click (aObject, aEvent) {
  if ($("#CheckBox_6")[0].checked == true) {
    $("#CheckBox_7")[0].disabled = false;
    $("#CheckBox_8")[0].disabled = false;
    $("#CheckBox_9")[0].disabled = false;
    $("#CheckBox_10")[0].disabled = false;
    $("#CheckBox_11")[0].disabled = false;
  } else {
    $("#CheckBox_7")[0].disabled = true;
    $("#CheckBox_8")[0].disabled = true;
    $("#CheckBox_9")[0].disabled = true;
    $("#CheckBox_10")[0].disabled = true;
    $("#CheckBox_11")[0].disabled = true;

    $("#CheckBox_7")[0].checked = false;
    $("#CheckBox_8")[0].checked = false;
    $("#CheckBox_9")[0].checked = false;
    $("#CheckBox_10")[0].checked = false;
    $("#CheckBox_11")[0].checked = false;
    $("#EdtBBCWQT")[0].readOnly = true;
    $("#EdtBBCWQT")[0].value = "";
  }
}

function CheckBox_17Click (aObject, aEvent) {
  if ($("#CheckBox_17")[0].checked == true) {
    $("#CheckBox_18")[0].disabled = false;
    $("#CheckBox_19")[0].disabled = false;
    $("#CheckBox_20")[0].disabled = false;
  } else {
    $("#CheckBox_18")[0].disabled = true;
    $("#CheckBox_19")[0].disabled = true;
    $("#CheckBox_20")[0].disabled = true;

    $("#CheckBox_18")[0].checked = false;
    $("#CheckBox_19")[0].checked = false;
    $("#CheckBox_20")[0].checked = false;
  }
}

//自定义函数
function SetSHDs (LIST, bol) {
  if (bol) {
    for (var i = 0; i < LIST.length; i += 1) {
      document.getElementById(LIST[i]).disabled = false;
    }
  } else {
    for (var i = 0; i < LIST.length; i += 1) {
      if (LIST[i].substring(0, 5) == "Radio")
        document.getElementById(LIST[i]).checked = false
      else if (LIST[i].substring(0, 3) == "Edt") {
        document.getElementById(LIST[i]).value = "";
        document.getElementById(LIST[i]).disabled = true;
      } else if (LIST[i].substring(0, 2) == "Cb") {
        document.getElementById(LIST[i]).checked = false;
        document.getElementById(LIST[i]).disabled = true;
      } else document.getElementById(LIST[i]).disabled = true;
    }
  }
}
function GYBL (aObject, aEvent) {
  alert(aObject.id + aObject.checked)
  var list = ['CheckBox_30', 'CheckBox_28', 'CheckBox_31', 'CheckBox_32', 'CheckBox_33', 'CheckBox_34', 'CheckBox_35', 'CheckBox_36', 'CheckBox_37', 'CheckBox_38', 'CheckBox_39']
  for (var i = 0; i < list.length; i++) {
    SetRadioDs(aObject.checked, list[i])
  }
}
function SetRadioDs (bol, id) {
  if (bol) document.getElementById(id).disabled = false
  else document.getElementById(id).disabled = true;
}

var radios1 = { 'Radio_23': 'EdtXL', 'Radio_28': 'EdtZC' };
for (var key in radios1) {
  $('#' + key).bind('input propertychange', function () {
    var val = '#' + radios1[this.id];
    if (this.checked) {
      $(val).attr("readonly", false);
      $(val).focus();
    } else {
      $(val).attr("readonly", true);
      $(val).val("");
    }
  })
}

function PubControl (bol, id) {
  if (bol) {
    $("#" + id).attr("readonly", false);
    //document.getElementById(id).disabled=false;
    document.getElementById(id).select();
  } else {
    $("#" + id).attr("readonly", true);
    //document.getElementById(id).disabled=true;
    document.getElementById(id).value = "";
  }
}

function Clear (LST) {
  if (LST != null) {
    for (var i = 0; i < LST.length; i += 1) document.getElementById(LST[i]).value = "";
  }
}
function EdtHSFocus (aObject, aEvent) {
  getEpBox(aObject, { epName: 'TBBLSJZYHSZD', epNext: '', epWidth: 200, epJson: [{ id: 'EdtHS', value: 1 }, { id: 'EdtHSBM', value: 0 }], defAttr: 'CBM' });
}