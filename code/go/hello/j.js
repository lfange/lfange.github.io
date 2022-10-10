//include("XTWH/BGKJS/89121/B033002-JXXNXGSJBGK.js");
include("PubJavaScript/JavaScript/PubBGK.js");
include(baseModule + "EpBox/EpBox.js");
var pubBGK = "";
var DataNode;
	/**保存前*/
    xmfView.SaveData = function(XMLNode){
    	XMLNode.append("XXG.3","0");//定正序号
    	XMLNode.append("XXG.4","89121");//文书编号 XXG.20
    	XMLNode.append("XXG.43",$("#HJDZ1").val()+"+"+$("#HJDZ2").val()+"+"+$("#HJDZ3").val()+"+"+$("#HJDZ4").val()+"+"+
    			$("#HJDZ5").val()+"+"+$("#HJDZ6").val()+"+"+$("#HJDZ7").val());//户籍地址
    	XMLNode.append("XXG.39",$("#XZZ1").val()+"+"+$("#XZZ2").val()+"+"+$("#XZZ3").val()+"+"+$("#XZZ4").val()+"+"+
		$("#XZZ5").val()+"+"+$("#XZZ6").val()+"+"+$("#XZZ7").val());//现地址
    	XMLNode.append("XXG.64",$("input[type='radio'][name='89121064']:checked").val());//ICD疾病
    	XMLNode.append("XXG.66",$("input[type='radio'][name='89121067']:checked").val());//转归编码
    	XMLNode.append("XXG.23",$("input[type=radio][name='89121023']:checked").val());//性别
    	//诊断依据
    	var checkboxValue="";
    	$("input[name='89121036']:checked").each(function(j){
    			checkboxValue+=$(this).attr("value2")+"|";
    	});
    	XMLNode.append("XXG.36",checkboxValue);//诊断依据
    	XMLNode.append("XXG.65",$("input[type=radio][name='89121065']:checked").val());//是否首次发病
    	XMLNode.append("XXG.55",$("input[type=radio][name='89121055']:checked").val());//确诊单位

 
    	
    	//alert(XMLNode.toObj().xml);
    }
	
	xmfView.FillOtherData = function(node){
	   //  alert(node.xml);
		DataNode=node;
		var HJDZ=node.selectSingleNode("//P89121043").text.split("+");//户籍地址
		var XZZ=node.selectSingleNode("//P89121039").text.split("+");//现地址
		for(var i=1;i<=7;i=i+1){
			$("#HJDZ"+i).val(HJDZ[i-1]);
		}
		for(var i=1;i<=7;i=i+1){
			$("#XZZ"+i).val(XZZ[i-1]);
		}
		if(node.selectSingleNode("//P89121063")!=null){
			$("[name='89121064'][value2='"+node.selectSingleNode("//P89121063").text+"']").attr("checked","checked");
		}
		$("#YZDRQ").val(node.selectSingleNode("//P89121054").text.substr(0,10));
		$("#ZDRQ,#DSWRQ,#YZDRQ").each(function(i,n){
			if($(n).val()=="1900-01-01"){
				$(n).val("");
			}
		});
		
		if(node.selectSingleNode("//P89121035")!=null){
			$("input[type=checkbox][name='CJBMC'][value2='"+node.selectSingleNode("//P89121035").text+"']").attr("checked","checked");
		}
		//在本辖区连续居住6个月以上
		if(node.selectSingleNode("//P89121082")!=null){
			$("input[type=radio][name='CLXJZ'][value2='"+node.selectSingleNode("//P89121082").text+"']").attr("checked","checked");	
		}
		//是否首次发病
		if(node.selectSingleNode("//P89121065")!=null){
			$("input[type=radio][name='89121065'][value2='"+node.selectSingleNode("//P89121065").text+"']").attr("checked","checked");
		}
		//确诊单位
		if(node.selectSingleNode("//P89121055")!=null){
			$("input[type=radio][name='89121055'][value2='"+node.selectSingleNode("//P89121055").text+"']").attr("checked","checked");
		}
		//转归
		if(node.selectSingleNode("//P89121067")!=null){
			$("input[type=radio][name='89121067'][value2='"+node.selectSingleNode("//P89121067").text+"']").attr("checked","checked");	
		}
		//死因
		if(node.selectSingleNode("//P89121068")!=null){
			$("input[type=radio][name='89121068'][value2='"+node.selectSingleNode("//P89121068").text+"']").attr("checked","checked");
		}
		
		//推断依据
		if(node.selectSingleNode("//P89121085")!=null){
			$("input[type=radio][name='89121085'][value='"+node.selectSingleNode("//P89121085").text+"']").attr("checked","checked");	
		}
		//疾病名称
		if(node.selectSingleNode("//P89121064")!=null){
			$("input[type=radio][name='89121064'][value='"+node.selectSingleNode("//P89121064").text+"']").attr("checked","checked");	
		}
		//是否首次发病
		if(node.selectSingleNode("//P89121066")!=null){
			$("input[type=radio][name='89121067'][value='"+node.selectSingleNode("//P89121066").text+"']").attr("checked","checked");	
		}
		//
		//诊断依据
		if(node.selectSingleNode("//P89121036")!=null){
			var checkboxes = node.selectSingleNode("//P89121036").text;
			var str = [];
			str = checkboxes.split("|");
				for(var i in str){
					$("input[name='89121036'][value2='"+str[i]+"']").attr("checked","checked");
				}
		}
		$("input[name='89121064']:checked").each(function(){
			$("#"+this.name+$(this).attr("value2")).css("color","blue");
		});
    }
	xmfView.CheckData = function(){
    	var emptyJson={BRXM:"病人姓名",SFZH:"身份证号",CSNY:"出生日期",CMZ:"民族",CHZZY:"患者职业",CLXR:"联系人",LXDH:"联系电话",Edit_20:"ICD编码",
    			DFBRQ:"发病时间",DZDRQ:"确诊日期",DTKRQ:"填卡日期",BGRQ:"报告日期"};
    	var bool=pubBGK.PubCheckData({empty:emptyJson})&&pubBGK.compareTime("CSNY","BGRQ")&&pubBGK.compareTime("DFBRQ","BGRQ")&&pubBGK.compareTime("DZDRQ","BGRQ")&&pubBGK.compareTime("DSWRQ","BGRQ");
        if(bool){
        		if(!/^\d{17}[0-9Xx]|^\s{0}$/.test($("#SFZH").val())){
	                alert("请输入正确的18位身份证号码");
	                $("#SFZH").focus();
	                return false;
	            }
        		if($("#SFZH").val().length==18&&$("#CSNY").val().replaceAll("-","")!=$("#SFZH").val().substr(6,8)){
        			alert("身份证号出生日期与出生日期不对应");
	                $("#SFZH").focus();
	                return false;
        		}
        		//诊断依据
        		if($("[name='89121036']:checked").val()==undefined){
        			alert("请选择诊断依据");
        			$("[name='89121036']")[0].focus();
        			return false;
        		}
        		//确诊单位
        		if($("[name='89121055']:checked").val()==undefined){
        			alert("请选择确诊单位");
        			$("[name='89121055']:eq(0)").focus();
        			return false;
        		}
        		//转归
        		if($("[name='89121067']:checked").val()==undefined){
        			alert("请选择转归");
        			$("[name='89121067']:eq(0)").focus();
        			return false;
        		}
        		if($("input[name='89121067']:checked").attr("value2")=="2"){
        			if($("#DSWRQ").val()==""){
        				alert("死亡日期不能为空");
        				$("#DSWRQ").focus();
        				return false;
        			}
        			if($("#CSWYY").val()==""){
        				alert("死亡原因不能为空");
        				$("#CSWYY").focus();
        				return false;
        			}
        		}
        		for(var i=1;i<6;i+=1){
        			if($("#HJDZ"+i).val().replace(/\s/g,"").length==0){
        				alert("请填写户籍地址");
        				$("#HJDZ"+i).focus();
        				return false;
        			}
        		}
        		for(var i=1;i<6;i=i+1){
        			if($("#XZZ"+i).val().replace(/\s/g,"").length==0){
        				alert("请填写现住址");
        				$("#XZZ"+i).focus();
        				return false;
        			}
        		}
        }
        $("#ZDRQ,#DSWRQ").each(function(i,n){
			if($(n).val()>DATE){
				alert($(n).attr("name")+"不能大于当前日期");
				$(n).select();
				bool=false;
			}
		});
        return bool;
    }
	//建立下拉框 
    function fillSelect(SelectName,jsonData){
        $("[name='"+SelectName+"']").each(function(){
            $(this).empty();
    		for(var name in jsonData){
				listAdd($(this),name,jsonData[name]);
			}
		});
	}
    
    /** CHECKBOX添加元素方法 参数一是Jquery对象*/
	function listAdd(oListbox,sName,sValue){
		var oOption="<option value='"+sName+"'>"+sValue+"</option>";
		oListbox.append(oOption);
	}
	xmfView.PageLoad = function(XMLNode){
    	pubBGK = new PubBGK();
        forbiddenZGSW(); //禁用转归相关的选项
       
    	this.CallMode = XMLNode.selectSingleNode("/MSG/MSH/CallMode").text;
    	var jbx = XMLNode.selectSingleNode("/MSG/JBX");
    	//户籍地址ep
    	pubBGK.ep_TBZDBZXZQ2({  address1:[true, "HJDZ1BM", "HJDZ1"],//省
					    		address2:[true, "HJDZ2BM", "HJDZ2"],//市
					    		address3:[true, "HJDZ3BM", "HJDZ3"],//乡
					    		address4:[true, "HJDZ4BM", "HJDZ4"],//村
					    		address5:[false, "HJDZ5BM", "HJDZ5"]//门牌号
					    		});
    	//现住地址ep
    	pubBGK.ep_TBZDBZXZQ2({  address1:[true, "XZZ1BM", "XZZ1"],//省
					    		address2:[true, "XZZ2BM", "XZZ2"],//市
					    		address3:[true, "XZZ3BM", "XZZ3"],//乡
					    		address4:[true, "XZZ4BM", "XZZ4"],//村
					    		address5:[false, "XZZ5BM", "XZZ5"]//门牌号
					    		});
    	
    	//出生年月和年龄绑定
    	$("#CSNY").bind('blur',function(){
    		var age=(new Date()).getTime()-(new Date($("#CSNY").val().replaceAll("-","/")).getTime());
    		$("#NL").val(Math.floor(age/31536000000));
    	});
    	var jsonEp={
    			CHZZY:{name:"CRBZYBM",value:"Edit_26",title:"患者职业",must:"1"},
    			CMZ:{name:"ZDBZMZ",value:"CMZBM",title:"民族",must:"1"},
    		CHYZK:{name:"ZDBZHYZK",value:"CHYZKBM",title:"婚姻状况",must:"1"}
    	};
    	pubBGK.bindShowEp(jsonEp); 
    	pubBGK.checkPhone("LXDH");
    	$("input[name='89121067']").click(function(){
    		if(this.value=='2'){
    			$("#DSWRQ").attr("disabled",false);
				$("#CSWYY,#CJTSWYY").attr("disabled",false);
    		}else{
    			$("#DSWRQ").attr("disabled",true);
    			$("#CSWYY,#CJTSWYY").attr("disabled",true);
    			$("#DSWRQ").val("");
    		}
    	});

    	$("input[name='89121055']").click(function(){
    		if(this.value=='省级医院'){
    			$("#ccjyymc").show();
    		}else{
    			$("#ccjyymc").hide();
    			$("#ccjyymc").val("");
    		}
    	});

    	//设置疾病选中状态颜色
    	$("input[name='89121064']").click(function(){
    		var obj = this;
    		  $("[name='"+this.name+"']").each(function(){
    				var mcObj= $(document.getElementById(this.name+$(this).attr("value2")));
    	    		if(obj!=this&&$(obj).attr("value2")!=$(this).attr("value2")){
    	    			mcObj.css("color","");
    	    		}else{
    	    			mcObj.css("color","blue");
    	    		}
	            });
    	});
    	//疾病名称不可用
    	if(this.CallMode=="stView"){
    		pubBGK.disabledAll();
    	}else if(this.CallMode=="stModify"){
    		pubBGK.setColor();
    	}
    	//转归click事件
    	$("input[type='radio'][name='89121067']").click(function(){
    		$("#CZGMC").val(this.value2);
    			if(this.value=="2"){
    				$("#DSWRQ,#CSWYY,#CJTSWYY").attr("disabled",false);
    			}else{
    				$("#DSWRQ,#CSWYY,#CJTSWYY").attr("disabled",true);
    			}
			});
    	
    	if (this.CallMode=="stAdd" || this.CallMode=="stReport") {
    		$("#BGRQ").val(DATE);
    		$("#BGKBM").val(jbx.selectSingleNode("CBGKLXBM")==null?"":jbx.selectSingleNode("CBGKLXBM").text);//报告卡类型编码
    		$("#BGKMC").val(jbx.selectSingleNode("CBGKLXMC")==null?"":jbx.selectSingleNode("CBGKLXMC").text);//报告卡类型
    		$("#BGKLB").val(1);//报告卡类型
     		$("#CJZH").val(jbx.selectSingleNode("CJZH")==null?"":jbx.selectSingleNode("CJZH").text);//获取就诊号
    		$("#SFZH").val(jbx.selectSingleNode("CSFZH")==null?"":jbx.selectSingleNode("CSFZH").text);//获取身份证号
    		$("#BRXM").val(jbx.selectSingleNode("CBRXM")==null?"":jbx.selectSingleNode("CBRXM").text);//姓名
    		var CBRXB = jbx.selectSingleNode("CBRXB")==null?"男":jbx.selectSingleNode("CBRXB").text;
    		$("[name='89121023'][value='"+ CBRXB +"']").attr("checked","checked");//性别
        	$("#CSNY").val((jbx.selectSingleNode("DCSNY")==null?"":jbx.selectSingleNode("DCSNY").text).substring(0,10));//出生日期
        	$("#LXDH").val(jbx.selectSingleNode("CLXDH")==null?"":jbx.selectSingleNode("CLXDH").text);//电话
        	$("#KS").val(jbx.selectSingleNode("CKSMC")==null?"":jbx.selectSingleNode("CKSMC").text);//科室名称
        	$("#KSB").val(jbx.selectSingleNode("CKSBM")==null?"":jbx.selectSingleNode("CKSBM").text);//科室编码
        	$("#JGMC").val(jbx.selectSingleNode("CJGMC")==null?"":jbx.selectSingleNode("CJGMC").text);//报卡单位
        	$("#JGID").val(jbx.selectSingleNode("CJGID")==null?"":jbx.selectSingleNode("CJGID").text);//报卡编码
        	$("#YSBM").val(OprGH);
        	$("#YSMC").val(OprXM);
        	$("#TYPE").val(jbx.selectSingleNode("ITYPE")==null?"":jbx.selectSingleNode("ITYPE").text);//病人类型
        	$("#CBRID").val(jbx.selectSingleNode("CBRID")==null?"":jbx.selectSingleNode("CBRID").text);//病人类型
        	$("#CJBMC").val($($("[name='89121062']:checked")).attr("value2"));//疾病名称
        	var icd1=jbx.selectSingleNode("CICD10BM")==null?"":jbx.selectSingleNode("CICD10BM").text.substr(0,3);
        	var icd=jbx.selectSingleNode("CICD10BM")==null?"":jbx.selectSingleNode("CICD10BM").text.substr(0,5);
        	var IType = jbx.selectSingleNode("ITYPE")==null?"":jbx.selectSingleNode("ITYPE").text;
       
        	if(IType == '0'){
        	    $("#CZYH").val(jbx.selectSingleNode("CJZH")==null?"":jbx.selectSingleNode("CJZH").text);//获取就诊号       住院
        	    $("#CMZH").val("");
        	}else if(IType == '1'){
        	     $("#CMZH").val(jbx.selectSingleNode("CJZH")==null?"":jbx.selectSingleNode("CJZH").text);//获取就诊号    门诊
        	     $("#CZYH").val("");
        	}
        	if(icd1=="I64"){
        		icd=icd1;
        	}
		}else if(this.CallMode=='stModify'){
		}else if(this.CallMode=='stView'){
			$(":text").attr("disabled",false);
			$(":text").css("color","blue");
			var IType = $("#TYPE").val();
		}
	
    }
	//民族字典
	function CMZFocus(aObject,aEvent){    	
		getEpBox(aObject,{epName:'ZDBZMZ',epJson:[{id:'CMZBM',epNext:'CMZ',value:0}]}); 
		}
	//职业字典
	function CZYFocus(aObject,aEvent){
		getEpBox(aObject,{epName:'CRBZYBM',epJson:[{id:'Edit_26',epNext:'CHZZY',value:0}]}); 
	}
	
	//疾病名称
	$("input[type=radio][name='89121062']").click(function(){
		if($(this).val()=="1"){
			$("input[name='89121084']").attr("disabled",false);
			$("input[name='89121085']").attr("disabled",true);
			$("input[name='89121085']").attr("checked",false);
			$("input[name='89121036']").each(function(){
				if($(this).val()<10){
					$(this).attr("disabled",false);
				}else{
					$(this).attr("disabled",true);
					$(this).attr("checked",false);
					
				}
			});
		}else if($(this).val()=="2"){
			$("input[name='89121084']").attr("disabled",true);
			$("input[name='89121084']").attr("checked",false);
			$("input[name='89121085']").attr("disabled",true);
			$("input[name='89121085']").attr("checked",false);
			$("input[name='89121036']").each(function(){
				if($(this).val()>=10&&$(this).val()<18){
					$(this).attr("disabled",false);	
				}else{
					$(this).attr("disabled",true);
					$(this).attr("checked",false);
					
				}
				
			});
				
		}else if($(this).val()=="3"){
			$("input[name='89121084']").attr("disabled",true);
			$("input[name='89121084']").attr("checked",false);
			$("input[name='89121085']").attr("disabled",false);
			$("input[name='89121036']").each(function(){
				if($(this).val()>=18){
					$(this).attr("disabled",false);	
				}else{
					$(this).attr("disabled",true);
					$(this).attr("checked",false);		
				}	
			});	
		}
	});
	
	//转归
	$("input[name='89121067'][value='1']").click(function(){
		$("#89121058").val("");
		$("input[name='89121068']").attr("checked",false);
	});
			//未选择转归死亡,则禁用死亡相关的选项
			function forbiddenZGSW(){
				$("#DSWRQ").attr("disabled",true);
				$("#CSWYY,#CJTSWYY").attr("disabled",true);
			}