//角色卡 JSON
var characterSheetTemp = {//角色數值暫存
    attributeKeyIn:{
    str: 0,
    con: 0,
    siz: 0,
    dex: 0,
    app: 0,
    int: 0,
    pow: 0,
    edu: 0,
}};
var characterSheet = {//角色卡
    name: '',
    occupation: '',
    package: '',
    gender: '',
    birth: '',
    residence: '',
    str: 0,
    con: 0,
    siz: 0,
    dex: 0,
    app: 0,
    int: 0,
    pow: 0,
    edu: 0,
    age: 0,
    luck: 0,
    mov: 0,
    hp: 0,
    mp: 0,
    bd: 0,
    build: 0,
    occupationSkills: [],//[[skill],[[skill,subskill], [skill,subskill]]]
    packageSkills: [],
    bonusSkills: [],
    bonusSkills: [],
    intSkills: [],
    packSkills: [],
    crFrom: 0,
    crFrom: 99,
    skills: {},
    weapons:{},
    eqipments:{
        cash: 0 ,
        assets: 0,
        spendinglv: 0,
        possession: [],
    },
    backstory: {
        bios:'',
        personalDescription: '',
        ideologyOrBeliefs: '',
        significantPeople: '',
        meaningfulLocations: '',
        treasuredPossessions: '',
        injuriesAndScars: '',
        phobiasAndManias: '',
        arcaneTomes: '',
        spellsAndArtifacts: '',
        encounterswithStrangeEntities: '',
    }
};
//db & build
var dbTable=[//DB體格表
    {strSiz:[2,64], db: '-2', build:-2},
    {strSiz:[65,84], db: '-1', build:-1},
    {strSiz:[85,124], db: '0', build:0},
    {strSiz:[125,164], db: '+1D4', build:1},
    {strSiz:[165,204], db: '+1D6', build:2},
    {strSiz:[205,284], db: '+2D6', build:3},
    {strSiz:[285,364], db: '+3D6', build:4},
    {strSiz:[365,444], db: '+4D6', build:5},
];
function dbCal(str,siz){//DB體格計算機
    for (let object of dbTable){
        if(str+siz>=object.strSiz[0] && str+siz<object.strSiz[1]){
            return {db: object.db , build: object.build}
        }
    }
    return {db: 'N/A', build:NaN};
};
//mov
function movCal(str,dex,siz){//MOV計算機
    if(str>siz && dex>siz){
        return 9;
    } else if(str<siz && dex<siz){
        return 7;
    } else {
        return 8;
    }
};
//機械元件
var fineMod=false;
var modCheck={attReduce:false, eduDep:false, luckRoll:false};
var att_selected=false;
//未調整的屬性
var str0=0;
var con0=0;
var siz0=0;
var dex0=0;
var int0=0;
var app0=0;
var pow0=0;
var edu0=0;
var mov0=0;
var db0=0;
var build0=0;
//已調整的屬性
var str=0;
var con=0;
var siz=0;
var dex=0;
var int=0;
var app=0;
var pow=0;
var edu=0;
var luck=0;
//年齡調整表
var ageModTable = [//年齡調整表
    {age: [15,19], text: '從 STR 或 SIZ 中擇一減去 5 點，將 EDU 減去 5 點，創角時決定 Luck 初始值的擲骰擲兩次、取高的那次。', young: -5, old: 0, luck: 2, mov: 0, edu: -5, edu_dep: 0, app: 0},
    {age: [20,39], text: '進行一次 EDU 成長擲骰。', young: 0, old: 0, luck: 1, mov: 0, edu: 0, edu_dep: 1, app: 0},
    {age: [40,49], text: '	從 STR、CON 或 DEX 中共減去 5 點，將 APP 減去 5 點，進行兩次 EDU 成長擲骰，MOV 減 1。', young: 0, old: -5, luck: 1, mov: -1, edu: 0, edu_dep: 2, app: -5},
    {age: [50,59], text: '從 STR、CON 或 DEX 中共減去 10 點，將 APP 減去 5 點，進行三次 EDU 成長擲骰，MOV 減 2。', young: 0, old: -10, luck: 1, mov: -2, edu: 0, edu_dep: 3, app: -5},
    {age: [60,69], text: '從 STR、CON 或 DEX 中共減去 20 點，將 APP 減去 10 點，進行四次 EDU 成長擲骰，MOV 減 3。', young: 0, old: -20, luck: 1, mov: -3, edu: 0, edu_dep: 4, app: -10},
    {age: [70,79], text: '從 STR、CON 或 DEX 中共減去 40 點，將 APP 減去 15 點，進行四次 EDU 成長擲骰，MOV 減 4。', young: 0, old: -40, luck: 1, mov: -4, edu: 0, edu_dep: 4, app: -15},
    {age: 80, text: '從 STR、CON 或 DEX 中共減去 80 點，將 APP 減去 20 點，進行四次 EDU 成長擲骰，MOV 減 5 。', young: 0, old: -80, luck: 1, mov: -5, edu: 0, edu_dep: 4, app: -20},
];
// 職業
//職業表
var era='era1920';
// 信用評級
var creditRatingTable = {};
// 武器
var weapons = {};
// 處理擲骰生成
var attribute = [];
var roll_count = 0;
let rollAttDice = function(){//屬性擲骰
    var str_dice = dice(3,6)*5;
    var con_dice = dice(3,6)*5;
    var siz_dice = (dice(2,6)+6)*5;
    var dex_dice = dice(3,6)*5;
    var app_dice = dice(3,6)*5;
    var int_dice = (dice(2,6)+6)*5;
    var pow_dice = dice(3,6)*5;
    var edu_dice = (dice(2,6)+6)*5;
    attribute[roll_count]={str:str_dice, con:con_dice, siz:siz_dice, dex:dex_dice, app:app_dice, int:int_dice, pow:pow_dice, edu:edu_dice};
    characterSheetTemp.attribute = attribute;
};
$(document).ready(function(){//更新屬性擲骰結果
    $("#attDice").click(function(){
        rollAttDice();
        $("#str").css("text-align","center");
        $("#con").css("text-align","center");
        $("#siz").css("text-align","center");
        $("#dex").css("text-align","center");
        $("#app").css("text-align","center");
        $("#int").css("text-align","center");
        $("#pow").css("text-align","center");
        $("#edu").css("text-align","center");
        $("#str").html(`${characterSheetTemp.attribute[roll_count].str}`);
        $("#con").html(`${characterSheetTemp.attribute[roll_count].con}`);
        $("#siz").html(`${characterSheetTemp.attribute[roll_count].siz}`);
        $("#dex").html(`${characterSheetTemp.attribute[roll_count].dex}`);
        $("#app").html(`${characterSheetTemp.attribute[roll_count].app}`);
        $("#int").html(`${characterSheetTemp.attribute[roll_count].int}`);
        $("#pow").html(`${characterSheetTemp.attribute[roll_count].pow}`);
        $("#edu").html(`${characterSheetTemp.attribute[roll_count].edu}`);
        roll_count++;
        $("#dice_count").html(`第 ${roll_count} 次擲骰`);
        $("#selector_att").append(`<option value="${roll_count-1}">第 ${roll_count} 次擲骰</option>`);
    });
});
function updateAtt(x){// 處理購點屬性
    var keyIn=document.getElementById(x).value;
    let y= x.replace('_keyin','');
    characterSheetTemp.attributeKeyIn[y] = keyIn;
    var attSum = sum(characterSheetTemp.attributeKeyIn);
    $("#att_sum").html(`共 ${attSum}`);
    if(mult(characterSheetTemp.attributeKeyIn)!==0){
        $("#selector_att").append(`<option value="attributeKeyIn">購點</option>`);
    }
}
function selectAtt(x){// 選擇器
    if(x=='empty'){
        $("#data_box_att").html('');
        return;
    }
    else if(x=='attributeKeyIn'){
        let selectedAtt = characterSheetTemp[x];
        str0=selectedAtt.str;
        con0=selectedAtt.con;
        siz0=selectedAtt.siz;
        dex0=selectedAtt.dex;
        int0=selectedAtt.int;
        app0=selectedAtt.app;
        pow0=selectedAtt.pow;
        edu0=selectedAtt.edu;
        db0=dbCal(str0,siz0).db;
        build0=dbCal(str0,siz0).build;
        mov0=movCal(str0, dex0, siz0);
        characterSheet.db=db0;
        characterSheet.build=build0;
        characterSheet.mov=mov0;
        characterSheet.mp=Math.floor(pow0/5);
        characterSheet.hp=Math.floor((con0+siz0)/10);
        att_selected=true;
        ageMod();
    }
    else{
        let selectedAtt = characterSheetTemp.attribute[x];
        str0=selectedAtt.str;
        con0=selectedAtt.con;
        siz0=selectedAtt.siz;
        dex0=selectedAtt.dex;
        int0=selectedAtt.int;
        app0=selectedAtt.app;
        pow0=selectedAtt.pow;
        edu0=selectedAtt.edu;
        db0=dbCal(str0,siz0).db;
        build0=dbCal(str0,siz0).build;
        mov0=movCal(str0, dex0, siz0);
        characterSheet.db=db0;
        characterSheet.build=build0;
        characterSheet.mov=mov0;
        characterSheet.mp=Math.floor(pow0/5);
        characterSheet.hp=Math.floor((con0+siz0)/10);
        att_selected=true;
        ageMod();
    }
}
// 年齡調整
var modTarget=0;
var fifteen=false;
var ageModRow={};
var eduDepDice=0;
$(document).ready(function(){
    var ageSlider = document.getElementById('age-input');
    noUiSlider.create(ageSlider, {
        start: [20],
        step: 1,
        range: {
            'min': [15],
            '6.757%': [20],
            '33.78%': [40],
            '47.3%': [50],
            '60.81%': [60],
            '74.32%': [70],
            '87.84': [80],
            'max': [89]
        },
        pips:{
            mode: 'range',
        }
    });
    ageSlider.noUiSlider.on('set' ,function(){ageMod(Math.floor(ageSlider.noUiSlider.get()))});
});
var age0 = 0;
function ageMod(age=20){//年齡調整計算
    ageModRow = age >= 80 ? ageModTable.filter(function(item){return item.age==80;}) : ageModTable.filter(function(item){return item.age[0]<=age && item.age[1]>=age;});
    if(age0!=age){age0=age;$("#selectedAge").html(` ${age} 歲`);}
    ageModRow = ageModRow[0];
    str=str0;
    con=con0;
    siz=siz0;
    dex=dex0;
    int=int0;
    app=app0 + ageModRow.app;
    pow=pow0;
    edu=edu0 + ageModRow.edu;
    fifteen = ageModRow.age==15 ? true : false;
    luckTatal = ageModRow.luck;
    characterSheet.age=age;
    eduDepDice=ageModRow.edu_dep;
    $("#age_mod_text").html(`<p><strong>年齡調整：</strong>${ageModRow.text}</p>`);
    modTarget=ageModRow.young+ageModRow.old;
    eduDiceHis=[];
    eduDepHis=[];
    luckArray=[];
    characterSheet.luck=0;
    modCheck={attReduce:false, eduDep:false, luckRoll:false};
    if(att_selected){print_data_box_app_mod()};
    ageModCal('str');
    ageModCal('con');
    ageModCal('siz');
    ageModCal('dex');
}
function print_data_box_app_mod(){//印出數值
   $("#strFormod").html(`<strong>STR</strong> ${str} `);
   $("#conForMod").html(`<strong>CON</strong> ${con} `);
   $("#sizForMod").html(`<strong>SIZ</strong> ${siz} `);
   $("#dexForMod").html(`<strong>DEX</strong> ${dex} `);
   $("#intForMod").html(`<strong>INT</strong> ${int} `);
   $("#appForMod").html(`<strong>APP</strong> ${app} ${isMod('app')}`);
   $("#powForMod").html(`<strong>POW</strong> ${pow} `);
   $("#eduForMod").html(`<strong>EDU</strong> ${edu} ${isMod('edu')}${eduDepInit()}`);
   $("#sanForMod").html(`<strong>SAN</strong> ${pow} `);
   $("#hpForMod").html(`<strong>HP</strong> ${characterSheet.hp} `);
   $("#dbForMod").html(`<strong>傷害加成（DB）：</strong>${characterSheet.db}${isDbMod()}`);
   $("#buildForMod").html(`<strong>體格：</strong>${characterSheet.build}${isBuildMod()}`);
   $("#movForMod").html(`<strong>MOV：</strong>${characterSheet.mov}${isMovMod()}`);
   $("#luckForMod").html(`<strong>幸運：</strong>3D6x5 <span class="hvr-buzz" id="luckDice" style="display: inline-block" onclick="genLuck()"><i class="fas fa-dice"></i></span>`);
   $("#mpForMod").html(`<strong>MP：</strong> ${characterSheet.mp}`);
}
var luckArray=[];
var luckTatal=1;
/* --- deisplay dice roll? --- */
function genLuck(){//生成幸運
    luck_dice();
    if(luckArray.length<luckTatal){
        $("#luckForMod").html(`<strong>幸運：</strong>${characterSheet.luck} ${isLuckMod()}<div class="hvr-buzz" id="luckDice" style="display: inline-block" onclick="genLuck()"><i class="fas fa-dice"></i></div>`);
    } else {
        $("#luckForMod").html(`<strong>幸運：</strong>${characterSheet.luck} ${isLuckMod()}`);
        if(characterSheet.age){modCheck.luckRoll=true;}
        checkMod();
    }
}
function isLuckMod(){//幸運調整顯示
    if(luckTatal>1){
        return `<sub>[${luckArray}]</sub> `;
    };
    return '';
}
function luck_dice(){//幸運擲骰
    var luck_dice = dice(3,6)*5;
    luckArray.push(luck_dice);
    characterSheet.luck=Math.max(...luckArray);
}
/* ---  EDU 調整 --- */
var eduDiceHis=[];
var eduDepHis=[];
function eduDepInit(){
    if(eduDepDice<=0){return `${isMod('edu')}${eduDepHisExp()}`;}
    else {return `${isMod('edu')}${eduDepHisExp()}<div class="hvr-buzz" style="display: inline-block" onclick="edu_dep()"><i class="fas fa-dice"></i></div>`};
}
function edu_dep(){
    eduDiceRoll();
    if(eduDiceHis.length<eduDepDice){
        $("#eduForMod").html(`<strong>EDU</strong> ${edu} ${isMod('edu')}${eduDepHisExp()}<div class="hvr-buzz" style="display: inline-block" onclick="edu_dep()"><i class="fas fa-dice"></i></div>`);
    } else {
        $("#eduForMod").html(`<strong>EDU</strong> ${edu} ${isMod('edu')}${eduDepHisExp()}`);
        modCheck.eduDep=true;
        checkMod();
    }
}
function eduDiceRoll(){
    var edu_dice = dice(1,100);
    let eduDepValue = edu_dice > edu ? dice(1,10) : 0;
    eduDiceHis.push(edu_dice);
    eduDepHis.push(eduDepValue);
    edu = edu + eduDepValue;
}
function eduDepHisExp(){
    var display ='';
    var diceHisDisplay='';
    var depHisDisplay='';
    if(eduDiceHis.length>0){
        for(count =0;count<eduDiceHis.length;count++){
            if (eduDepHis[count]==0){
                diceHisDisplay = `<font color="gray">${eduDiceHis[count]}</font>`;
                depHisDisplay = `<font color="gray">${eduDepHis[count]}</font>`;
            } else if(eduDepHis[count]>0){
                diceHisDisplay = `<font color="green">${eduDiceHis[count]}</font>`;
                depHisDisplay = `<font color="green">${eduDepHis[count]}</font>`;
            }
            display = display + `[${diceHisDisplay}:${depHisDisplay}]`
        }
        return `<sub>${display}</sub>`;
    }
    return '';
}
/* ---  isMods --- */
function isMod(att){
    if(att == 'str'){ var cal = str; var cal0 = str0;}
    else if(att == 'con'){var cal = con; var cal0 = con0;}
    else if(att == 'dex'){var cal = dex; var cal0 = dex0;}
    else if(att == 'siz'){var cal = siz; var cal0 = siz0;}
    else if(att == 'app'){var cal = app; var cal0 = app0;}
    else if(att == 'edu'){var cal = edu; var cal0 = edu0;}
    if (cal - cal0 >0 ){
        return ` <sub style="color:green">${cal - cal0}</sub> `;
    }else if(cal - cal0 <0 ){
        return ` <sub style="color:red">${cal -cal0}</sub> `;
    }else{
        return ``;
    }
}
function isMovMod(){
    if(mov0>characterSheet.mov){
        return ` <sub style="color:red">${characterSheet.mov-mov0}</sub> `;
    }
    return '';
}
function isDbMod(){
    if(db0!=characterSheet.db){
        return ` <i class="fas fa-angle-down" style="color:red"></i> `;
    }
    return '';
}
function isBuildMod(){
    if(build0>characterSheet.build){
        return ` <sub style="color:red">${characterSheet.build-build0}</sub> `;
    }
    return '';
}
/* --- about the arrows ---*/
var Up = {str:false, siz:false, con:false, dex:false};
var UpUp = {str:false, siz:false, con:false, dex:false};
var Down = {str:false, siz:false, con:false, dex:false};
var DownDown = {str:false, siz:false, con:false, dex:false};
function ageModCal(att, value=0){
    if(att == 'str'){str = str + value;}
    else if(att == 'con'){con = con + value;}
    else if(att == 'dex'){dex = dex + value;}
    else if(att == 'siz'){siz = siz + value;}
    if(fifteen){
        Up = {str:false, siz:false, con:false, dex:false};
        UpUp = {str:false, siz:false, con:false, dex:false};
        Down = {str:false, siz:false, con:false, dex:false};
        DownDown = {str:false, siz:false, con:false, dex:false};
        var modified = str - str0 + siz - siz0;
        if(str - str0 < -4){UpUp.str = true;}else{UpUp.str = false;}
        if(siz - siz0 < -4){UpUp.siz = true;}else{UpUp.siz = false;}
        if(modTarget -  modified < -4){
            if(str > 6){DownDown.str = true;}else{DownDown.str = false;}
            if(siz > 6){DownDown.siz = true;}else{DownDown.siz = false;}
        };
        if(modified==modTarget && characterSheet.age){modCheck.attReduce=true;}
    }else{
        Up = {str:false, siz:false, con:false, dex:false};
        UpUp = {str:false, siz:false, con:false, dex:false};
        Down = {str:false, siz:false, con:false, dex:false};
        DownDown = {str:false, siz:false, con:false, dex:false};
        var modified = str - str0 + dex - dex0 + con - con0;
        if(fineMod && str - str0 < 0){Up.str = true;}else{Up.str = false;}
        if(fineMod && dex - dex0 < 0){Up.dex = true;}else{Up.dex = false;}
        if(fineMod && con - con0 < 0){Up.con = true;}else{Up.con = false;}
        if(str - str0 < -4){UpUp.str = true;}else{UpUp.str = false;}
        if(dex - dex0 < -4){UpUp.dex = true;}else{UpUp.dex = false;}
        if(con - con0 < -4){UpUp.con = true;}else{UpUp.con = false;}
        if(fineMod && modTarget -  modified < 0){
            if(str > 1){Down.str = true;}else{Down.str = false;}
            if(dex > 1){Down.dex = true;}else{Down.dex = false;}
            if(con > 1){Down.con = true;}else{Down.con = false;}
        };
        if(modTarget -  modified < -4){
            if(str > 6){DownDown.str = true;}else{DownDown.str = false;}
            if(dex > 6){DownDown.dex = true;}else{DownDown.dex = false;}
            if(con > 6){DownDown.con = true;}else{DownDown.con = false;}
        };
        if(modified==modTarget && characterSheet.age){modCheck.attReduce=true;checkMod();}
    }
    characterSheet.db=dbCal(str,siz).db;
    characterSheet.build=dbCal(str,siz).build;
    characterSheet.mov=ageModRow.mov? movCal(str, dex, siz)+ageModRow.mov: movCal(str, dex, siz);
    characterSheet.mp=Math.floor(pow/5);
    characterSheet.hp=Math.floor((con+siz)/10);
    $("#dbForMod").html(`<strong>傷害加成（DB）：</strong>${characterSheet.db}${isDbMod()}`);
    $("#buildForMod").html(`<strong>體格：</strong>${characterSheet.build}${isBuildMod()}`);
    $("#buildForMod").html(`<strong>MOV：</strong>${characterSheet.mov}${isMovMod()}`);
    $("#mpForHp").html(`<strong>HP</strong> ${characterSheet.hp} `);
    $("#strForMod").html(`<strong>STR</strong> ${str} ${isMod('str')}${arrowDownDown('str')}${arrowUpUp('str')}${arrowDown('str')}${arrowUp('str')}`);
    $("#conForMod").html(`<strong>CON</strong> ${con} ${isMod('con')}${arrowDownDown('con')}${arrowUpUp('con')}${arrowDown('con')}${arrowUp('con')}`);
    $("#sizForMod").html(`<strong>SIZ</strong> ${siz} ${isMod('siz')}${arrowDownDown('siz')}${arrowUpUp('siz')}${arrowDown('siz')}${arrowUp('siz')}`);
    $("#dexForMod").html(`<strong>DEX</strong> ${dex} ${isMod('dex')}${arrowDownDown('dex')}${arrowUpUp('dex')}${arrowDown('dex')}${arrowUp('dex')}`);
    checkMod();
}
function checkMod(){
    if(modCheck.attReduce && modCheck.eduDep && modCheck.luckRoll){
        $("#age_mod_check").html("年齡調整完成。");
        $("#age_mod_check").removeClass("alert-danger");
        $("#age_mod_check").addClass("alert-success");
    }else{$("#age_mod_check").html("年齡調整尚未完成。");
        $("#age_mod_check").removeClass("alert-success");
        $("#age_mod_check").addClass("alert-danger");
    }
}
function arrowUpUp(att){
    if(UpUp[att]){
        return ` <i class="fas fa-angle-double-up" onclick="ageModCal('${att}', 5)"></i> `;
    }
    return ``;
}
function arrowUp(att){
    if(Up[att]){
        return ` <i class="fas fa-angle-up" onclick="ageModCal('${att}', 1)"></i> `;
    }
    return ``;
}
function arrowDown(att){
    if(Down[att]){
        return ` <i class="fas fa-angle-down" onclick="ageModCal('${att}', -1)"></i> `;
    }
    return ``;
}
function arrowDownDown(att){
    if(DownDown[att]){
        return ` <i class="fas fa-angle-double-down" onclick="ageModCal('${att}', -5)"></i> `;
    }
    return ``;
}
// 選擇職業
var version= 'era1920';
function selectVersion(x){
    version = keyIn=document.getElementById(x).value;
}
var occupationSkills = [];
var bonusSkills= [];
var packSkills= [];
var intSkills= [];
var crFrom = 0;
var crTo = 99;
var occuText= '';
var filteredOccu=[];
$(document).ready(function () {
    occuFilter();
});
function printOccuTable(){
    $("#occupationsTable > tbody").html('');
    for (oc of filteredOccu){
        var no = oc.note ? oc.note : '';
        var da = [];
        if(oc.EDU!=4){
            if(oc['STR'] != 0){da.push('STR')};
            if(oc['CON'] != 0){da.push('CON')};
            if(oc['DEX'] != 0){da.push('DEX')};
            if(oc['SIZ'] != 0){da.push('SIZ')};
            if(oc['APP'] != 0){da.push('APP')};
            if(oc['POW'] != 0){da.push('POW')};
            if(oc['INT'] != 0){da.push('INT')};
        }
        var das = da.join(' 或 ');
        $("#occupationsTable > tbody").append(
            `<tr>
                <td scope="row">${oc.term}</td>
                <td>${das}</td>
                <td>${oc.text}</td>
                <td style="text-align:center">${oc.crFrom} - ${oc.crTo}</td>
                <td>${no}</td>
            </tr>`
        );
    }
}
var ocFilter={
    att: [],
    skills: [],
    crFrom: 0,
    crTo: 99,
    term: [],
};
function updateOcFilterTerm(x){
    var keyIn=document.getElementById(x).value;
    ocFilter.term = Array.from(keyIn);
    occuFilter();
}
var fit = true;
function occuFilter(filter=ocFilter){
    var conditions={era1920: version=='era1920',modern: version=='modern', gaslight: version=='gaslight'};
    filteredOccu=[];
    occu.forEach((item)=>{
        if((conditions.era1920 && item.era1920) || (conditions.modern && item.modern) || (conditions.gaslight && item.gaslight)){
            fit = true;
            if(!filter.att==[]){
                for (ele of filter.att){
                    if(occu[ele]==0){
                        fit=false;
                    }
                }
            }
            if(!filter.skills==[]){
                var skilln = 'skill';
                var testArray = [];
                for (skill of filter.skills){
                    for (count=1;count<=9;count++){
                        if(skill==item[skilln+count]){
                            testArray,push(1);
                        } else {testArray,push(0)};
                    }
                    var test = testArray.reduce((a,b)=>a+b);
                    if(test==0){fit=false};
                }
            }
            if(!filter.term==[]){
                var c = true;
                for (let ele of filter.term){
                    if(!Array.from(item.term).includes(ele)){c=false};
                }
                if(!c){
                fit = false;
                }
            }
            }
            if(fit){
                filteredOccu.push(item);
                filteredOccu = filteredOccu.filter(item=>item.crFrom>=filter.crFrom);
                filteredOccu = filteredOccu.filter(item=>item.crTo<=filter.crTo);
            }
    });
    printOccuTable();
}
function occuSelect(x=''){
    if(x){
        characterSheet.occupation={x};
        filteredOccu.forEach((item)=>{
            if(item.term == characterSheet.occupation){
                occupationSkills.push([item.option1,item.subOption1],[item.option2,item.subOption2],[item.option3,item.subOption3],[item.option4,item.subOption4],[item.option5,item.subOption5],[item.option6,item.subOption6],[item.option7,item.subOption7],[item.option8,item.subOption8],[item.option9,item.subOption9]);
                characterSheet.crFrom=item.crFrom;
                characterSheet.crFrom=item.crTo;
                occuText=item.text;
            }
            });
    }
    characterSheet.occupationSkills=occupationSkills;
}
// 分配技能
var skillsAssign=skillInit(skills[era]);
function skillInit(array){
    var skillName= '';
    var skillBasic= '';
    var skillValue= skillBasic;
    var skillOccu= false;
    var skillPack= false;
    var skillInt= 0;
    var skillOccuP= 0;
    var skillPackage= 0;
    var skillBonus= 0;
    assignTable=[];;
    for (obj of array){
        skillName= obj.skillZhTw;
        skillBasic= obj.basic;
        skillOccu= characterSheet.occupationSkills ? [] : characterSheet.occupationSkills.includes(skillName);
        skillPack= characterSheet.packSkills ? [] : characterSheet.packSkills.includes(skillName);
        skillBonus= characterSheet.bonusSkills ? [] : characterSheet.bonusSkills.includes(skillName);
        var skillObj = {
            skillname : skillName,
            skillBasic : skillBasic,
            skillValue : skillValue,
            skillOccu : skillOccu,
            skillPack : skillPack,
            skillInt : skillInt,
            skillOccuP: skillOccuP,
            skillPackage : skillPackage,
            skillBonus : skillBonus,
        }
        assignTable.push(skillObj);
    }
    return assignTable;
}