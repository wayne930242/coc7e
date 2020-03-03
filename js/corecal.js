var characterSheetTemp = {//角色數值暫存
    //角色卡 JSON
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
    skills:{
        occuSkills: [],
        pack1Skills: [],
        pack2Skills: [],
        bunusSkills: [],
    },//[[skill],[[skill,subskill], [skill,subskill]]]
    skillAssign:{
        occuSkills: 0,
        intSkills: 0,
        pack1Skills: 0,
        pack2Skills: 0,
        bonusSkills: 0,
    },
    crFrom: 0,
    crTo: 0,
    skill:[],
    weapons:{},
    eqipments:{
        cash: 0 ,
        assets: 0,
        assetsContent: '',
        spendinglv: 0,
        possession: '',
    },
    backstory: {
        bios:'',
        personalDescription: '',
        ideologyOrBeliefs: '',
        significantPeople: '',
        meaningfulLocations: '',
        treasuredPossessions: '',
        traits: '',
        injuriesAndScars: '',
        phobiasAndManias: '',
        arcaneTomesSpellsAndArtifacts: '',
        encountersWithStrangeEntities: '',
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
var skillToRating = [
    {range: [-Infinity,-1], rating: '錯誤'},
    {range: [0,5], rating: '外行人'},
    {range: [6,19], rating: '新手'},
    {range: [20,49], rating: '業餘'},
    {range: [50,74], rating: '職業'},
    {range: [75,89], rating: '專家'},
    {range: [90,99], rating: '世界級'},
    {range: [100,Infinity], rating: '超越人類'},
]
function dbCal(a,b){//DB體格計算機
    for (let object of dbTable){
        if(a+b>=object.strSiz[0] && a+b<object.strSiz[1]){
            return {db: object.db , build: object.build}
        }
    }
    return {db: 'N/A', build:NaN};
};
//mov
function movCal(x,y,z){//MOV計算機
    if(x>z && y>z){
        return 9;
    } else if(x<z && y<z){
        return 7;
    } else {
        return 8;
    }
};
//機械元件
var fineMod=false;
var modCheck={attReduce:false, eduDep:false, luckRoll:false};
var att_selected=false;
var eduDepDice=0;
var Up = {str:false, siz:false, con:false, dex:false};
var UpUp = {str:false, siz:false, con:false, dex:false};
var Down = {str:false, siz:false, con:false, dex:false};
var DownDown = {str:false, siz:false, con:false, dex:false};
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
// 信用評級
var creditRatingTable = {
    era1920: [
        {range: [-Infinity,-1], rating: '錯誤'},
        {range: [0,0], rating: '身無分文', cash: [0.5, false], caseRange: NaN, assets: [0, false], assetsRange: NaN, spendingLevel: 0.25},
        {range: [1,9], rating: '貧窮', cash: [1, true], caseRange:[1,9], assets: [10, true], assetsRange: [10,90], spendingLevel: 2},        
        {range: [10,49], rating: '平均', cash: [2, true], caseRange:[20,98], assets: [50, true], assetsRange: [500,2450], spendingLevel: 10},
        {range: [50,89], rating: '小康', cash: [5, true], caseRange:[250,445], assets: [50, true], assetsRange: [25000,44500], spendingLevel: 50},
        {range: [90,98], rating: '富裕', cash: [20, true], caseRange:[1800,1960], assets: [2000, true], assetsRange: [180000,196000], spendingLevel: 250},
        {range: [99,99], rating: '超有錢', cash: [50000, false], caseRange: NaN, assets: [5000000, false], assetsRange: [5000000,Infinity], spendingLevel: 5000},
        {range: [100,Infinity], rating: '錯誤'},
    ],
    modern: [
        {range: [-Infinity,-1], rating: '錯誤'},
        {range: [0,0], rating: '身無分文', cash: [10, false], caseRange: NaN, assets: [0, false], assetsRange: NaN, spendingLevel: 10},
        {range: [1,9], rating: '貧窮', cash: [20, true], caseRange:[20,180], assets: [200, true], assetsRange: [200,1800], spendingLevel: 40},        
        {range: [10,49], rating: '平均', cash: [40, true], caseRange:[400,1960], assets: [1000, true], assetsRange: [10000,49000], spendingLevel: 200},
        {range: [50,89], rating: '小康', cash: [100, true], caseRange:[5000,8900], assets: [10000, true], assetsRange: [500000,890000], spendingLevel: 1000},
        {range: [90,98], rating: '富裕', cash: [400, true], caseRange:[36000,39200], assets: [400000, true], assetsRange: [36000000,39200000], spendingLevel: 5000},
        {range: [99,99], rating: '超有錢', cash: [1000000, false], caseRange: NaN, assets: [100000000, false], assetsRange: [100000000,Infinity], spendingLevel: 100000},
        {range: [100,Infinity], rating: '錯誤'},
    ]
};
// Backstory
var diceForBackstory = {
    personalDescription:[
        "粗獷","帥氣","醜陋","漂亮","迷人","娃娃臉","聰明臉","懶散","呆滯","髒亂","耀眼","書呆子","年輕","委靡","豐滿","粗壯","多毛","苗條","優雅","襤褸","矮胖","蒼白","陰沉","大眾臉","紅潤","曬黑","皺紋","古板","羞怯","敏銳","健壯","嬌俏","肌肉棒子","魁梧","笨拙","脆弱",
    ],
    ideologyOrBeliefs:[
        "有崇拜與禱告的上位力量（如：Vishnu、Jesus Christ、Haile Selassie I）",
        "人類並不需要宗教（如：無神論者、人文主義者、世俗論者）",
        "科學解答了一切。選擇一個感興趣的形象（如：演化論、低溫物理學、宇宙探索）",
        "相信命運（如：業報、種姓制度、迷信）",
        "會社或秘密會社成員（如：共濟會、婦女會、Anonymous)",
        "邪惡必須從社會根除。哪種邪惡？（如：毒品、暴力、種族主義）",
        "神祕學（如：占星術、招魂、塔羅牌）",
        "政治（保守、社會主義者、自由）",
        "「錢就是力量，我要盡可能得到全部」（如：貪婪、野心、無情）",
        "競選者/活動者（如：女權主義、平等權、工會）",
    ],
    significantPeople:[
        "父母（如：媽媽、爸爸、繼母）",
        "祖父母（如：媽媽那邊的祖母、爸爸那邊的祖父）",
        "兄弟姊妹（如：哥哥、同父異母弟弟、繼妹妹）",
        "孩子（如：兒子、女兒）",
        "伴侶（如：配偶、未婚妻、愛人）",
        "教你最高級職業技能的人。標註他教了你什麼技能（如：學校老師、你拜的老師、你爸）",
        "兒時朋友（如：同學、鄰居、想像中的朋友）",
        "名人。你的偶像或是英雄。從可能從未遇過他（如：電影明星、政治家、音樂家）",
        "遊戲中的另一個同伴探索者。自己或隨機選一個。",
        "一個遊戲中的 NPC 。叫守密人幫你選一個。",
    ],
    significantPeople2:[
        "你感激他們。他們如何幫助你？（如：經濟上、在你的艱苦時刻保護你、給你第一份工作）",
        "他們教了你某件事。那是什麼？（如：一個技能、去愛、當個男子漢）",
        "他們給予你人生的意義。如何？（如：你渴望成為他們、你想和他們在一起、你想讓他們快樂）",
        "你傷害了他們，想要和好。你做了什麼？（如：偷了他們的錢、告訴警察關於他們的事、在他們沮喪時拒絕幫忙）",
        "共享一段經歷。什麼？（如：你們一起度過了一段艱苦的時光、你們一起長大、你們曾一起作戰）",
        "你想向他們證明你自己。如何？（如：得到一份好工作、找到一個好老婆、書讀得很好）",
        "你視他們為偶像（如：因為他們的名望、他們的美貌、他們的作品）",
        "一種懊悔（如：你本該死在他們那裡、你們因你說的某件事而分手、當有機會時你沒有前去伸出援手）",
        "你希望證明自己比他們更好。他們的瑕疵是什麼？（如：懶惰、酗酒、缺乏愛心）",
        "他們讓你痛苦，你想要復仇。你為何責怪他們？（如：愛人之死、你的事業被毀、婚姻破碎）",
    ],
    meaningfulLocations:[
        "你學習的地方（如：學校、大學）",
        "你的家鄉（如：農村、商鎮、繁華都市）",
        "你遇見初戀的地方（如：音樂會、假日、防空洞）",
        "可安靜沈思的地方（如：圖書館、在你的莊園散步、釣魚）",
        "社交場所（如：紳士俱樂部、當地酒吧、叔叔的屋子）",
        "連結到你的「意識型態/信念」的地方（如：教區教堂、麥加、巨石陣）",
        "一個重要人士的墓地。誰？（如：父或母、孩子、愛人）",
        "真正的家（如：郊區宅邸、出租公寓、你長大的孤兒院）",
        "你在那裡度過最快樂的日子（如：初吻的公園長凳、你的大學）",
        "你的工作地點（如：辦公室、圖書館、銀行）",
    ],
    treasuredPossessions:[
        "一個關聯到你的最高技能的物品（如：昂貴的西裝、假 ID、手指虎）",
        "你的職業的本質物品（如：醫生包、車、開鎖器）",
        "童年回憶（如：漫畫、折疊小刀、幸運錢幣）",
        "死者遺物（如：珠寶、在表中的相片、一封信）",
        "你的「重要人士」送你的東西（如：戒指、日記、地圖）",
        "你的收集。什麼收集？（如：公車票、動物玩偶、錄音）",
        "某個你正在找但是不知道是什麼的東西——你渴求答案（如：你在一個衣櫃中找到的不明語言寫成的信、從你先父遺物中找到的不明來源的奇異煙斗、在你花園中挖出的奇異銀球）",
        "運動用品（如：板球球棒、簽名球、釣魚桿）",
        "武器（如：配槍、你的老獵槍、藏在靴子裡的斧頭）",
        "寵物（如：狗、貓、烏龜）",
    ],
    traits:[
        "慷慨的（如：小費給很多、總會伸出援手、慈善家）",
        "善待動物（如：愛貓、在農場長大、瞭解馬兒）",
        "夢想家（如：讓幻想起飛、富有遠見、高度創意）",
        "享樂主義者（如：派對人生、有趣的酒鬼、及時行樂）",
        "賭徒性格（如：撲克臉、什麼都試、活在懸崖邊）",
        "好廚子（如：烤超棒的蛋糕、隨便都能變出大餐、精緻味覺）",
        "情聖/狐狸精（如：溫文儒雅、動人聲線、勾人眼神）",
        "忠誠（如：為朋友兩肋插刀、從未背信、願意為信念而死）",
        "美好名聲（如：全國最好的飯後演講者、大善人、無畏者）",
        "野心（如：達到一個目標、當老闆、佔有它的一切）",
    ],
}
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
    if(roll_count==0){
        $("#first-att-dice").html(`第 ${roll_count+1} 次擲骰`);
        $("#first-att-dice").attr("value",`"${roll_count}"`);
        selectAtt(0);
    }
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
        $("#dice_count").html(`第 ${roll_count} 次`);
        if(roll_count!=1){
            $("#selector_att").append(`<option value="${roll_count-1}">第 ${roll_count} 次擲骰</option>`);
        }
    });
});
function updateAtt(x){// 處理購點屬性
    var keyIn=document.getElementById(x).value;
    let y= x.replace('_keyin','');
    characterSheetTemp.attributeKeyIn[y] = parseInt(keyIn);
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
// TODO 自動切換到下一個 input
$(document).ready(function () {
    $('.key-in-input').keyup(function(e){   
        if($(this).val().length==2) {
            $(this).next().focus();
        }
    });
});
var age0 = 20;
var modTarget=0;
var fifteen=false;
var ageModRow={};
var sAge = 20;
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
            density: 5
        }
    });
    ageSlider.noUiSlider.on('slide' ,function(){sAge=Math.floor(ageSlider.noUiSlider.get())});
    ageSlider.noUiSlider.on('slide' ,function(){ageMod(sAge)});
    ageSlider.noUiSlider.on('slide' ,function(){$("#selectedAge").val(sAge)});
    $("#selectedAge").change(function(){
        sAge=$("#selectedAge").val();
        ageSlider.noUiSlider.set(sAge);
        ageMod(sAge);
    });
});
function ageMod(a=age0){//年齡調整計算
    ageModRow = a >= 80 ? ageModTable.filter(function(item){return item.age==80;}) : ageModTable.filter(function(item){return item.age[0]<=a && item.age[1]>=a;});
    ageModRow = ageModRow[0];
    str=str0;
    con=con0;
    siz=siz0;
    dex=dex0;
    int=int0;
    app=app0 + ageModRow.app;
    pow=pow0;
    edu=edu0 + ageModRow.edu;
    db0=dbCal(str0,siz0).db;
    build0=dbCal(str0,siz0).build;
    mov0=movCal(str0, dex0, siz0);
    fifteen = ageModRow.age[0]>=15 && ageModRow.age[0]<20 ? true : false;
    luckTatal = ageModRow.luck;
    characterSheet.age=a;
    eduDepDice=ageModRow.edu_dep;
    $("#age_mod_text").html(`<p><strong>年齡調整：</strong>${ageModRow.text}</p>`);
    modTarget=ageModRow.young+ageModRow.old;
    eduDiceHis=[];
    eduDepHis=[];
    luckArray=[];
    characterSheet.luck=0;
    modCheck={attReduce:false, eduDep:false, luckRoll:false};
    print_data_box_app_mod();
    ageModCal('str');
    ageModCal('con');
    ageModCal('siz');
    ageModCal('dex');
    skillInit();
    assignSkills();
}
function print_data_box_app_mod(){
    if(att_selected){
        $("#strForMod").html(`${str}`);
        $("#conForMod").html(`${con}`);
        $("#sizForMod").html(`${siz}`);
        $("#dexForMod").html(`${dex}`);
        $("#intForMod").html(`${int}`);
        $("#appForMod").html(`${app}`);
        $("#isAppMod").html(`${isMod('app')}`);
        $("#powForMod").html(`${pow}`);
        $("#eduForMod").html(`${edu}`);
        $("#isEduMod").html(`${isMod('edu')}`);
        $("#eduHistory").html(`${eduDepHisExp()}`);
        $("#eduDice").html(`${edu_dice()}`);
        $("#sanForMod").html(`${pow}`);
        $("#hpForMod").html(`${characterSheet.hp}`);
        $("#dbForMod").html(`${characterSheet.db}`);
        $("#isDbMod").html(`${isDbMod()}`);
        $("#buildForMod").html(`${characterSheet.build}`);
        $("#isBuildMod").html(`${isBuildMod()}`);
        $("#movForMod").html(`${characterSheet.mov}`);
        $("#isMovMod").html(`${isMovMod()}`);
        $("#luckForMod").html(`<sub>3D6x5</sub>`);
        $("#luckHistory").html(`${luckHistory()}`);
        $("#luckDice").html(`${luckDice()}`);
        $("#mpForMod").html(`${characterSheet.mp}`);
    }
}
var luckArray=[];
var luckTatal=1;
/* --- deisplay dice roll? --- */
function luckDice(){
    return `<span class="hvr-wobble-vertical pointer" style="display: inline-block" onclick="genLuck()"><i class="fas fa-dice"></i></span>`;
}
function genLuck(){//生成幸運
    luck_dice();
    if(luckArray.length<luckTatal){
        $("#luckForMod").html(`${characterSheet.luck}`);
        $("#luckHistory").html(`${luckHistory()}`);
        $("#luckDice").html(`${luckDice()}`);
    } else {
        $("#luckForMod").html(`${characterSheet.luck}`);
        $("#luckHistory").html(`${luckHistory()}`);
        $("#luckDice").html('');
        if(characterSheet.age){modCheck.luckRoll=true;}
        checkMod();
    }
}
function luckHistory(){//幸運調整顯示
    if(luckTatal>1){
        return `<sub style="color:gray">${luckArray}</sub>`;
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
function edu_dice(){
    if(eduDiceHis.length<eduDepDice){
        return `<div class="hvr-wobble-vertical pointer" style="display: inline-block" onclick="edu_dep()"><i class="fas fa-dice"></i></div>`;
    }
    else{
        modCheck.eduDep=true;
        checkMod();
        return '';
    }
}
function edu_dep(){
    eduDiceRoll();
    $("#eduForMod").html(`${edu}`);
    $("#isEduMod").html(`${isMod('edu')}`);
    $("#eduHistory").html(`${eduDepHisExp()}`);
    $("#eduDice").html(`${edu_dice()}`);
}
function eduDiceRoll(){
    var d = dice(1,100);
    let edv = d > edu ? dice(1,10) : 0;
    eduDiceHis.push(d);
    eduDepHis.push(edv);
    edu = edu + edv;
}
function eduDepHisExp(){
    var display ='';
    var diceHisDisplay='';
    var depHisDisplay='';
    if(eduDiceHis.length>0){
        for(count =0;count<eduDiceHis.length;count++){
            if (eduDepHis[count]==0){
                diceHisDisplay = `${eduDiceHis[count]}`;
                depHisDisplay = `${eduDepHis[count]}`;
                display = display + `[<span style="color:gray">${diceHisDisplay}:${depHisDisplay}</span>]`;
            } else if(eduDepHis[count]>0){
                diceHisDisplay = `${eduDiceHis[count]}`;
                depHisDisplay = `${eduDepHis[count]}`;
                display = display + `[<span style="color:green">${diceHisDisplay}:${depHisDisplay}</span>]`;
            }
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
        return `<sub style="color:green">+${Math.abs(cal - cal0)}</sub>`;
    }else if(cal - cal0 <0 ){
        return `<sub style="color:red">-${Math.abs(cal - cal0)}</sub>`;
    }else{
        return ``;
    }
}
function isMovMod(){
    if(mov0>characterSheet.mov){
        return `<sub style="color:red">-${Math.abs(characterSheet.mov-mov0)}</sub>`;
    }
    return '';
}
function isDbMod(){
    if(db0!=characterSheet.db){
        return `<sub style="color:red">${db0}<i class="fas fa-angle-down"></i></sub>`;
    }
    return '';
}
function isBuildMod(){
    if(build0>characterSheet.build){
        return `<sub style="color:red">-${Math.abs(characterSheet.build-build0)}</sub>`;
    }
    return '';
}
/* --- about the arrows ---*/
function ageModCal(att, v=0){
    if(att == 'str'){str = str + v;}
    else if(att == 'con'){con = con + v;}
    else if(att == 'dex'){dex = dex + v;}
    else if(att == 'siz'){siz = siz + v;}
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
    characterSheet.str=str;
    characterSheet.con=con;
    characterSheet.siz=siz;
    characterSheet.dex=dex;
    characterSheet.app=app;
    characterSheet.int=int;
    characterSheet.pow=pow;
    characterSheet.edu=edu;
    if(att_selected){
        print_data_box_app_mod();
        $("#strArrow").html(`${arrow('str')}`);
        $("#conArrow").html(`${arrow('con')}`);
        $("#sizArrow").html(`${arrow('siz')}`);
        $("#dexArrow").html(`${arrow('dex')}`);
        checkMod();
    }
}
function arrow(att){
    let group = '';
    group = UpUp[att]? group + `<button type="button" class="btn btn-success active" onclick="ageModCal('${att}', 5)"><i class="fas fa-angle-double-up"></i></button>`: group + `<button type="button" class="btn btn-success" disabled="disabled"><i class="fas fa-angle-double-up"></i></button>`;
    group = DownDown[att]? group + `<button type="button" class="btn btn-danger active" onclick="ageModCal('${att}', -5)"><i class="fas fa-angle-double-down"></i></button>`: group + `<button type="button" class="btn btn-danger" disabled="disabled"><i class="fas fa-angle-double-down"></i></button>`;
    return group;
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
// 選擇職業
var era='era1920';
function selectVersion(x){
    era = x;
    skillInit();
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
        var os = oc.term == characterSheet.occupation ? ` class="occuSelect"` :'';
        var das = '';
        if(oc.EDU==4){
            das = `EDU x4`;
        } else {
            das = da.join(' 或 ') +` x2 `+ `加 EDU x2` ;
        }
        $("#occupationsTable > tbody").append(
            `<tr${os}>
                <td class="occuTerm" id="${oc.term}" scope="row">${oc.term}</td>
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
$(document).ready(function(){
    var ageSlider = document.getElementById('cr-input');
    noUiSlider.create(ageSlider, {
        start: [0,99],
        step: 1,
        snap: true,
        range: {
            'min': [0],
            '10%': [10],
            '20%': [20],
            '30%': [30],
            '40%': [40],
            '50%': [50],
            '60%': [60],
            '70%': [70],
            '80%': [80],
            '90%': [90],
            'max': [99]
        },
        connect: true,
        pips:{
            mode: 'range',
            density: 10
        }
    });
    ageSlider.noUiSlider.on('slide' ,function(){
        ocFilter.crFrom = Math.floor(ageSlider.noUiSlider.get()[0]);
        ocFilter.crTo = Math.floor(ageSlider.noUiSlider.get()[1]);
        occuFilter();
    });
});
function updateOcFilterTerm(x){
    var keyIn=document.getElementById(x).value;
    ocFilter.term = Array.from(keyIn);
    occuFilter();
}
var fit = true;
function occuFilter(filter=ocFilter){
    var conditions={era1920: era=='era1920',modern: era=='modern', gaslight: era=='gaslight'};
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
$(document).ready(function (){
    $("#occupationsTable").on('click', 'tbody tr', function(){
        $(this).addClass('occSelect').siblings().removeClass('occSelect');
        var id = $(this).find('.occuTerm').attr('id');
        occuSelect(id);
    });
    $(window).scroll(function () {
        var scrollVal = $(this).scrollTop();
        var adscrtop=$("#occupationsTable").offset().top;
        if(scrollVal>adscrtop){
            $(".occuCard-top").css({"position": "fixed","top": "0px","background-color":"white","z-index":"99","width":"100vw","left":"0px"});
        }else{
            $(".occuCard-top").css({"position": "static","width":"100vw","left":"0px"});
        }
    });
});
var occupationSkills=[];
var ocSkills='';
function occuSelect(x=''){
    var ocTerm='';
    var ocAtt='';
    var ocCR='';
    var ocNote='無';
    var ocAtt = '';
    var sp= 0;
    var sps='';
    var a=[];
    if(x){
        characterSheet.occupation=x;
        filteredOccu.forEach((item)=>{
            if(item.term == characterSheet.occupation){
                var da=[];
                // NOTE occupationSkills
                occupationSkills=[[item.option1,item.subOption1, item.skill1, {occu: false, pack1: false, pack2: false}],[item.option2,item.subOption2, item.skill2, {occu: false, pack1: false, pack2: false}],[item.option3,item.subOption3, item.skill3, {occu: false, pack1: false, pack2: false}],[item.option4,item.subOption4, item.skill4, {occu: false, pack1: false, pack2: false}],[item.option5, item.subOption5, item.skill5, {occu: false, pack1: false, pack2: false}],[item.option6,item.subOption6, item.skill6, {occu: false, pack1: false, pack2: false}],[item.option7,item.subOption7, item.skill7, {occu: false, pack1: false, pack2: false}],[item.option8,item.subOption8, item.skill8, {occu: false, pack1: false, pack2: false}],[item.option9,item.subOption9, item.skill9, {occu: false, pack1: false, pack2: false}]];
                ocSkills= item.text;
                ocTerm= item.term;
                if(item.EDU!=4){
                    if(item['STR'] != 0){da.push('STR');a.push(characterSheet.str);}
                    if(item['CON'] != 0){da.push('CON');a.push(characterSheet.con);};
                    if(item['DEX'] != 0){da.push('DEX');a.push(characterSheet.dex);};
                    if(item['SIZ'] != 0){da.push('SIZ');a.push(characterSheet.siz);};
                    if(item['APP'] != 0){da.push('APP');a.push(characterSheet.app);};
                    if(item['POW'] != 0){da.push('POW');a.push(characterSheet.pow);};
                    if(item['INT'] != 0){da.push('INT');a.push(characterSheet.int);};
                }
                sp= Math.max(...a);
                if(oc.EDU==4){
                    ocAtt = `EDU x4`;
                    sp = characterSheet['edu'] * 4;
                } else {
                    ocAtt = da.join(' 或 ') + ` x2 ` + `加 EDU x2`;
                    sp * 2 + characterSheet['edu'] *2;
                }
                sps= `，共 ${sp} 點`;
                ocNote= item.note? item.note : '無';
                ocCR= item.crFrom + "-" + item.crTo;
                characterSheet.occupation= ocTerm;
                characterSheet.crFrom= item.crFrom;
                characterSheet.crTo= item.crTo;
                characterSheet.skillAssign.occuSkills = sp;
                characterSheet.skillAssign.intSkills = characterSheet.int*2 ;
            }
        });
    }
    $("#selectOccuTable").html(`<p class="desc card-text"><strong>${ocTerm}</strong>。${ocSkills}。<br/><strong>職業技能</strong>${ocAtt}${sps}，<strong>CR：</strong>${ocCR}。<br/><strong>備註</strong>：${ocNote}。</p><br><div id="" class="btn btn-primary occuTableToggle">確定</div>`);
    skillInit();
    assignSkills();

}
// fix occu table
$(document).ready(function () {
    $("#selectOccuTable").on("click", ".occuTableToggle" ,function(event){
        event.preventDefault();
        $("#occupationsTable").toggle("fast",function(){
            switch($(".occuTableToggle").text()){
                case "確定" : $(".occuTableToggle").html("重選");
                $(".occuCard-top").css({"position": "static"});
                $("#occuCard").removeClass("occuCard-top");  
                $("html, body").animate({ scrollTop: $("#skillAnchor").offset().top }, 500);
                break;
                default : $(".occuTableToggle").html("確定");
                $("#occuCard").addClass("occuCard-top");
            }
        });
    });
});
// 分配技能
$(document).ready(function () {
   skillInit(); 
});
var assignTable=[];
var skillPool = '';
function skillInit (array=skills[era]){
    skillPool='';
    $("#occu-skill-assign").html(`
        <tr id="信用評級-input" class="occu-skill skill-entry skill-entry-0">
            <td align="left">
                <button type="button" class="btn btn-primary btn-sm occu-skill-table skill-name" id="信用評級">信用評級</button>
            </td>
            <td class="basic">
                0
            </td>
            <td class="level-input-td">
                <input class="form-control form-control-sm level-input occu-input occu-input-0" type="text">
            </td>
            <td class="bonus-input-td">
                <input class="form-control form-control-sm bonus-input" type="text">
            </td>
            <td class="level">
                0
            </td>
            <td class="flag">
            </td>
        </tr>               
    `);
    $("#skill-assign").html('');
    assignTable=[];
    for (obj of array){
        var name= typeof(obj.skillZhTw)==="string" ? obj.skillZhTw : obj.skillZhTw[0] + '（' + obj.skillZhTw[1] + '）';
        var array = typeof(obj.skillZhTw)==="string" ? [obj.skillZhTw] : obj.skillZhTw
        var occu= false;
        for (let array of occupationSkills){
            if (array[0].includes(occu)){
                occu = true;
            }
        }
        var pack1= false;
        var pack2= false;
        var skillObj = {
            name : name,
            array: array,
            basic : obj.basic,
            origin: true,
            occu : occu,
            pack1 : pack1,
            pack2 : pack2,
            common : obj.common,
            sub: obj.sub,
        }
        var subSkill = 'nonSubSkill';
        if(obj.sub){subSkill = 'subSkill';}
        var allSkillArray = assignTable.map(item => item.name);
        var id = name;
        id = id.replace('/','-');
        if(!allSkillArray.includes(name)){assignTable.push(skillObj);}
        if(!allSkillArray.includes(name) && skillObj.name!="信用評級" && skillObj.origin){
            var occuSkillsIndex = 'occu-skill-pool ';
            // NOTE maybe can remove
            if (occupationSkills != []){
                var i = 0;
                for (let array of occupationSkills){
                    if(array[0]=="any" || (array[0].includes(name))){
                        occuSkillsIndex = occuSkillsIndex + 'occu' + i + ' ';
                    }
                    i++;
                }
            }
            if(skillObj.common) {
                skillPool+=`<button type="button" class="btn btn-outline-secondary btn-sm skillpoolbutton skillpoolbutton-common ${subSkill} ${occuSkillsIndex}" id="${id}-skill-pool">${name}</button>`;
            } else {
                skillPool+=`<button type="button" class="btn btn-outline-danger btn-sm skillpoolbutton skillpoolbutton-uncommon ${subSkill} ${occuSkillsIndex}" id="${id}-skill-pool">${name}</button>`;
            }
        }
    }
    $("#skill-pool").html(skillPool);
    for (let arr of occupationSkills){
        if (arr[0] == "any"){arr[0] = assignTable.map(obj => obj.name);}
    }
}
function basicCal(basic){
    if(basic=="EDU"){
        return characterSheet.edu;
    }else if(basic=="DEX / 2"){
        return Math.floor(characterSheet.dex/2);
    }else{
        return basic;
    }
}
var countDD = 1;
function printSkillTable(skill, sub, basic=1){
    var level = basic ;
    for(let ele of assignTable){
        if(ele.name == skill){basic = ele.basic};
    }
    basicText = basic;
    basic = basicCal(basic);
    var options = "";
    for (let obj of subskills){
        if(skill==obj.term){
            for(let sub of obj.sub){
                options+=`<a class="dropdown-item subskill-option">${sub.term}</a>`;
            }
        };
    }
    var menu = '';
    if (options){
        menu = `
        <div class="input-group-append dropright">
            <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="sr-only">選擇子技能</span>
            </button>
            <div class="dropdown-menu">
                ${options}
            </div>
        </div>`
    }
    var skillAssign = "#skill-assign";
    var key = 0;
    var f = true;
    var odkma = [];
    for (let e of occupationSkills) {
        if(e[0].includes(skill)){
            if(!e[3]['occu']){odkma.push(key)};
            f = false;
        }
        key ++;
    }
    var flag = f ?  '' : `
    <div class="btn-group">
        <button type="button" class="occu-dropdown btn btn-outline-primary btn-sm dropdown-toggle occu-dropdown-${countDD}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">職業技能</button>
        <div class="dropdown-menu occu-dropdown-menu-${countDD}">${occuDropdownMenu(odkma,countDD)}</div>
    </div>`;
    if(sub){
        $(skillAssign).append(`
        <tr class="skill-entry skill-entry-${countDD} data-basic=${basic}">
            <td align="left">
                <div class="input-group">    
                    <button type="button" class="btn btn-secondary btn-sm subskill-table skill-name" id="${skill}">${skill}</button>
                    <input type="text" class="form-control form-control-sm subskill-input" aria-label="選擇子技能">
                    ${menu}
                </div>
            </td>
            <td class="basic">
                ${basicText}
            </td>
            <td class="level-input-td">
                <input class="form-control form-control-sm level-input" type="text">
            </td>
            <td class="bonus-input-td">
                <input class="form-control form-control-sm bonus-input" type="text">
            </td>
            <td class="level">
                ${level}
            </td>
            <td class="flag">
                ${flag}
            </td>
        </tr>`
    );} else {
        $(skillAssign).append(`
            <tr class="skill-entry skill-entry-${countDD}" data-basic=${basic}">
                <td align="left">
                    <button type="button" class="btn btn-secondary btn-sm skill-name non-subskill-table" id="${skill}">${skill}</button>
                </td>
                <td class="basic">
                    ${basicText}
                </td>
                <td class="level-input-td">
                    <input class="form-control form-control-sm level-input" type="text">
                </td>
                <td class="bonus-input-td">
                    <input class="form-control form-control-sm bonus-input" type="text">
                </td>
                <td class="level">
                    ${level}
                </td>
                <td class="flag">
                    ${flag}
                </td>
            </tr>`
    );}
    countDD ++;
}
function occuDropdownMenu(array, k){
    if (array == []){return;}
    var options = '';
    for (let e of array){
            options += `<div class="dropdown-item occu-dropdown-item" onclick="selectOccuOption(${e}, ${k})">${occupationSkills[e][2]}</div>`;
        }
    return options;
}
function cancelOccuOption(e ,k){
    var t = $(`.skill-entry-${k}`).find(".skill-name").attr("id").replace("-","/");
    occupationSkills[e][3] = {occu: false};
    var key = 0;
    var odkma = [];
    for (let a of occupationSkills) {
        if(a[0].includes(t)){
            if(!a[3]['occu']){odkma.push(key)};
            f = false;
        }
        key ++;
    }
    $(`.occu-dropdown-${k}`).removeClass('btn-primary');
    $(`.occu-dropdown-${k}`).html("職業技能");
    $(`.occu-dropdown-${k}`).addClass('btn-outline-primary');
    $(`.occu-dropdown-menu-${k}`).html(`${occuDropdownMenu(odkma,k)}`);
    $(`.skill-entry-${k}`).appendTo("#skill-assign");
    $(`.skill-entry-${k}`).find(".skill-name").addClass("btn-secondary");
    $(`.skill-entry-${k}`).find(".skill-name").removeClass("btn-primary");
    $(`.skill-entry-${k}`).find(".level-input").removeClass('occu-input');
    assignSkills();
    printSkillHelper()
}
function selectOccuOption(e, k){
    occupationSkills[e][3] = {occu: k};
    $(`.occu-dropdown-${k}`).html(occupationSkills[e][2]);
    $(`.occu-dropdown-${k}`).removeClass('btn-outline-primary');
    $(`.occu-dropdown-${k}`).addClass('btn-primary');
    $(`.occu-dropdown-menu-${k}`).html(`<div class="dropdown-item" onclick="cancelOccuOption(${e}, ${k})">取消指派</div>`);
    $(`.skill-entry-${k}`).appendTo("#occu-skill-assign");
    $(`.skill-entry-${k}`).find(".skill-name").removeClass("btn-secondary");
    $(`.skill-entry-${k}`).find(".skill-name").addClass("btn-primary");
    $(`.skill-entry-${k}`).find(".level-input").addClass('occu-input');
    assignSkills();
    printSkillHelper()
}
$(document).ready(function () {
    // click the skill pool buttons
    $("#skill-assign, #occu-skill-assign").on("click", ".non-subskill-table" ,function(){
        var id = $(this).attr("id").replace('/','-');
        $(this).parents(".skill-entry").hide();
        $(`#${id}-skill-pool`).show();
    });
    $("#skill-assign, #occu-skill-assign").on("click", ".subskill-table" ,function(){
        $(this).parents(".skill-entry").hide();
    });
    $("#skill-pool").on("click", ".subSkill", function(){
        var a = 1;
        var skill = $(this).text();
        for (let ele of assignTable){
            if(ele.array[0]==skill){
                a = ele.basic;
            }
        }
        printSkillTable(skill, true, a);
    });
    $("#skill-pool").on("click", ".nonSubSkill" , function(){
        var skill = $(this).text();
        var array = [skill];
        if (skill=='火器（步槍/霰彈槍）') {
            array = ["火器","步槍/霰彈槍"];
        } else if (skill=='火器（手槍）'){
            array = ["火器", "手槍"];
        } else if (skill=='戰鬥（鬥毆）'){
            array = ["戰鬥","鬥毆"];
        }
        var a = 1;
        for (let ele of assignTable){
            if(JSON.stringify(ele.array)==JSON.stringify(array)){
                a = ele.basic;
            }
        }
        printSkillTable(skill, false, a);
        $(this).hide();
    });
    $("#skill-assign, #occu-skill-assign").on("click", ".subskill-option" , function(){
        assignSkills();
        printSkillHelper()
    })
    $("#skill-assign, #occu-skill-assign").on("change", ".level-input" ,function(){
        assignSkills();
        printSkillHelper();
    });
    $("#skill-assign, #occu-skill-assign").on("change", ".bonus-input" ,function(){
        assignSkills();
        printSkillHelper()
    });
});
var total = {
    occuSkills: 0,
    intSkills: 0,
    pack1Skills: 0,
    pack2Skills: 0,
    bonusSkills: 0,
}
function assignSkills(){
    total = {
        occuSkills: 0,
        intSkills: 0,
        pack1Skills: 0,
        pack2Skills: 0,
        bonusSkills: 0,
    }
    characterSheet.skill = [];
    $(".skill-entry").each(function(){
        var basic = $(this).attr("data-basic")?parseInt($(this).attr("data-basic")):0;
        var level = $(this).find(".level-input").val()?$(this).find(".level-input").val():basic;
        var occu = $(this).find(".level-input").hasClass("occu-input");
        var occuAssign = 0;
        var intAssign = 0;
        var arr = [];
        var bonus = $(this).find(".bonus-input").val()? $(this).find(".bonus-input").val() : 0 ;
        total.bunusSkills += bonus;
        if($(this).find(".skill-name").hasClass(".subskill-table")){
            var skill = $(this.find(".skill-name").text());
            var sub = $(this.find(".subskill-input").val());
            arr = [skill, sub];
        } else {
            var skill = $(this).find(".skill-name").text();
            arr = [skill];
        }
        var f = true ;
        for (let s of characterSheet.skill){
            if( JSON.stringify(s.array) == JSON.stringify(arr)){
                s.level = level;
                f = false;
            }
        }
        if (f){
            characterSheet.skill.push({array: arr, level: level});
        }
        if (occu){
            if(characterSheet.skillAssign.occuSkills - total.occuSkills > level - basic){
                occuAssign = level - basic;
            } else {
                occuAssign = characterSheet.skillAssign.occuSkills - total.occuSkills;
                intAssign = level - basic - characterSheet.skillAssign.occuSkills + total.occuSkills ;
            }
        } else {
            intAssign = level - basic;
        }
        var display = '';
        if ( arr[0] == "信用評級") {
            c = [];
            for (let r of creditRatingTable[era]){
                if(r.range[0] <= parseInt(level) + parseInt(bonus) && parseInt(level) + parseInt(bonus) <= r.range[1]){
                    display =`${parseInt(level) + parseInt(bonus)}` + "（" + r.rating + "）" ;
                    spendingLevel = r.spendingLevel;
                    cash = r.cash[1] ? level * r.cash[0] : r.cash[0] ;
                    assets = r.assets[1] ? level * r.assets[0] : r.assets[0] ;
                    c = [spendingLevel ,cash , assets];
                    characterSheet.eqipments.cash = cash;
                    characterSheet.eqipments.assets = assets;
                    characterSheet.eqipments.spendinglv = spendingLevel;
                }
                printCRDetails(c);
            }
        } else {
            for (let r of skillToRating){
                if(r.range[0] <= parseInt(level) + parseInt(bonus) && parseInt(level) + parseInt(bonus) <= r.range[1]){
                    display =`${parseInt(level) + parseInt(bonus)}` + "（" + r.rating + "）";
                }
            }
        }
        total.intSkills += intAssign;
        total.occuSkills += occuAssign;
        $(this).find(".level").html(`<p>${display}</p>`);
    });
}
function printCRDetails(c){
    $(".print-splv").html(c[0]);
    $(".print-cash").html(c[1]);
    $(".print-assets").html(c[2]);
}
function printSkillHelper(){
    var isOccuOver ='color: #dc3545';
    var isIntOver ='color: #dc3545';
    if (total.occuSkills < characterSheet.skillAssign.occuSkills){
        isOccuOver = 'color: #6c757d';
    } else if (total.occuSkills > characterSheet.skillAssign.occuSkills){
        isOccuOver = 'color: #dc3545';
    } else {
        isOccuOver = 'color: #28a745';
    }
    if (total.intSkills < characterSheet.skillAssign.intSkills){
        isIntOver = 'color: #6c757d';
    } else if (total.intSkills > characterSheet.skillAssign.intSkills){
        isIntOver = 'color: #dc3545';
    } else {
        isIntOver = 'color: #28a745';
    }
    $(".skill-helper").html(`<p><strong>信用評級範圍</strong>：${characterSheet.crFrom} - ${characterSheet.crTo}。<strong>職業技能</strong>：${ocSkills}。<br/><strong>職業技能點數</strong>：<span style="${isOccuOver}">${total.occuSkills} / ${characterSheet.skillAssign.occuSkills}</span>。<strong>興趣技能點數</strong>：<span style="${isIntOver}">${total.intSkills} / ${characterSheet.skillAssign.intSkills}</span>。</p>`);
}
$(document).ready(function () {
    $(".backstory-form-control").on("change", function(){
        var id = $(this).attr("id");
        var entry = '';
        switch(id){
            case "personal-description-input": entry = 'personalDescription' ; break;
            case "ideology-beliefs-input" : entry = 'ideologyOrBeliefs' ; break;
            case "significant-people-input" : entry = 'significantPeople' ; break;
            case "meaningful-locations-input" : entry = 'meaningfulLocations' ; break;
            case "treasured-possessions-input" : entry = 'treasuredPossessions' ;break;
            case "traits-input" : entry = 'traits' ; break;
            case "injuries-and-scars-input" : entry = 'injuriesAndScars' ; break;
            case "phobias-and-manias-input" : entry = 'phobiasAndManias' ; break;
            case "arcan-tomes-spells-and-artifacts-input" : entry = 'arcaneTomesSpellsAndArtifacts' ; break;
            case "encounters-with-strange-entities-input" : entry = 'encountersWithStrangeEntities' ; break;
            default : entry = 'bios' ;
        }
        characterSheet.backstory[entry] = $(this).val();
    });
    $("#equipment-input").on("change", function(){
        characterSheet.eqipments.possession = $(this).val();
        $(".print-possession").html($(this).val());
    });
    $("#assets-input").on("change", function(){
        characterSheet.eqipments.assetsContent =  $(this).val();
        $(".print-assetsContent").html($(this).val());
    });
});
var weaponsCore = weaponsCoreRaw.filter(item => item[era]);
var weaponIndex = 0;
$(document).ready(function () {
    $(".weapon-card-container").on("click", ".weapon-type", function(){
        var type = $(this).text();
        $(this).parents(".dropdown").find(".dropdown-toggle").html(type);
        $(this).parents(".dropdown").find(".dropdown-toggle").removeClass("btn-outline-secondary");
        $(this).parents(".dropdown").find(".dropdown-toggle").addClass("btn-secondary");
        $(this).parents(".weapon-table").find(".dropdown-toggle-select").html('細項');
        $(this).parents(".weapon-table").find(".weapon-skill").html('');
        $(this).parents(".weapon-table").find(".weapon-damage").html('');
        $(this).parents(".weapon-table").find(".weapon-range").html('');
        $(this).parents(".weapon-table").find(".weapon-attack").html('');
        $(this).parents(".weapon-table").find(".weapon-ammo").html('');
        $(this).parents(".weapon-table").find(".weapon-mal").html('');
        wps = weaponsCore.filter(item => item.type == type);
        $(this).parents(".weapon-table").find(".weapon-select").html('');
        for (let wp of wps){
            $(this).parents(".weapon-entry-1").find(".weapon-select").append(`<div class="dropdown-item weapon">${wp.name}</div>`);
        }
    })
    $(".weapon-card-container").on("click", ".weapon", function(){
        var w = $(this).text();
        var num = $(this).parents(".card-body").attr("data-num")? $(this).parents(".card-body").attr("data-num"):0;
        $(this).parents(".dropdown").find(".dropdown-toggle").removeClass("btn-outline-secondary");
        $(this).parents(".dropdown").find(".dropdown-toggle").addClass("btn-secondary");
        $(this).parents(".dropdown").find(".dropdown-toggle").html(w);
        for (let wp of weaponsCore){
            if(wp.name == w){
                var s = wp.subskill? wp.skill+ "（" + wp.subskill + "）": wp.skill;
                $(this).parents(".weapon-table").find(".weapon-skill").html(`<strong>技能 </strong>${s}`);
                $(this).parents(".weapon-table").find(".weapon-damage").html(`<strong>傷害 </strong>${wp.damage}`);
                $(this).parents(".weapon-table").find(".weapon-range").html(`<strong>範圍 </strong>${wp.range}`);
                $(this).parents(".weapon-table").find(".weapon-attack").html(`<strong>攻擊 </strong>${wp.attack}`);
                $(this).parents(".weapon-table").find(".weapon-ammo").html(`<strong>彈藥 </strong>${wp.ammo}`);
                $(this).parents(".weapon-table").find(".weapon-mal").html(`<strong>故障 </strong>${wp.malfunction}`);
            }
        }
        characterSheet.weapons[num] = w;
    })
    $(".weapon-card-container").on("click", ".add-weapon-entry", function () {
        $(this).parents(".weapon-card").after(`
            <div class="card weapon-card">
                <div class="card-body" data-num="${weaponIndex}">
                    <span class="remove-this-entry"><i class="fas fa-minus-circle"></i></span>
                    <table class="table weapon-table">
                        <tbody>
                            <tr class="weapon-entry-1">
                                <td>
                                    <div class="dropdown">
                                        <button class="btn btn-outline-secondary dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">分類</button>
                                        <div class="dropdown-menu">
                                            <div class="dropdown-item weapon-type">常規武器</div>
                                            <div class="dropdown-item weapon-type">手槍</div>
                                            <div class="dropdown-item weapon-type">步槍</div>
                                            <div class="dropdown-item weapon-type">突擊步槍</div>
                                            <div class="dropdown-item weapon-type">衝鋒槍</div>
                                            <div class="dropdown-item weapon-type">機關槍</div>
                                            <div class="dropdown-item weapon-type">爆炸物和重武器</div>
                                        </div>
                                    </div>
                            </td>
                            <td>
                                    <div class="dropdown">
                                        <button class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-select btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">細項</button>
                                        <div class="dropdown-menu weapon-select">
                                        </div>
                                    </div>
                                </td>
                                <td class="weapon-skill"></td>
                                <td class="weapon-damage"></td>
                            </tr>
                            <tr class="weapon-entry-2">
                                <td class="weapon-range"></td>
                                <td class="weapon-attack"></td>
                                <td class="weapon-ammo"></td>
                                <td class="weapon-mal"></td>
                            </tr>
                        </tbody>
                    </table>
                    <span class="add-weapon-entry"><i class="fas fa-plus-circle"></i></span>
                </div>
            </div>
            `);
        weaponIndex++;
    });
    $(".weapon-card-container").on("click", ".remove-this-entry", function () {
        var num = $(this).parents(".card-body").attr("data-num") ? $(this).parents(".card-body").attr("data-num"):0 ;
        characterSheet.weapons[num] = '';
        $(this).parents(".weapon-card").remove();
    });
});
var uploadedAvatar = '';
$("document").ready(function() {
    $('#avatar-upload').on("change", function() {
      var $files = $(this).get(0).files;
      var formData = new FormData();
      formData.append("image", $files[0]);
      if ($files.length) {
        // Reject big files
        if ($files[0].size > $(this).data("max-size") * 1024) {
          console.log("Please select a smaller file");
          return false;
        }
  
        var apiUrl = 'https://api.imgur.com/3/image';
        var apiKey = 'c9a11bd36c9482a';
        var settings = {
          async: true,
          crossDomain: true,
          url: apiUrl,
          method: "POST",
          datatype: "json",
          headers: {
            Authorization: "Client-ID " + apiKey
          },
          processData: false,
          contentType: false,
          data: formData,
          beforeSend: function() {
            console.log("uploading...");
          },
          success: function(res) {
            $('.uploaded-avatar').append('<img src="' + res.data.link + '" width="100%">');
            uploadedAvatar = res.data.link;
          },
          error: function() {
            alert("upload failed");
          }
        }
        $.ajax(settings).done(function(res) {
          console.log("Done");
        });
      }
    });
  });
$(document).ready(function () {
    $(".gender-input").on("change", function(){
        characterSheet.gender = $(this).val();
    });
    $(".name-input").on("change", function(){
        characterSheet.name = $(this).val();
    });
    $(".birth-input").on("change", function(){
        characterSheet.birth = $(this).val();
    });
    $(".residence-input").on("change", function(){
        characterSheet.residence = $(this).val();
    });
    $(".export-btn").on("click", function(){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterSheet));
        console.log(dataStr);
        var dt = new Date();
        $("<a />", {
            "href": dataStr,
            "download": `wayneh-tw-coc7e-${dt.getTime()}.json`
        }).appendTo('body').click(function(){
            $(this).remove();
        })[0].click();
    });
    $(".import-btn").on("change", function(){
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    });
    $(".simp-character-btn").on("click", function(){
        printSimpCharacter();
    });
});
function onReaderLoad(event){
    characterSheet = JSON.parse(event.target.result);
    printSimpCharacter();
}
function printSimpCharacter(){
    $(".simp-character-sheet").html(`
        <div><strong>${characterSheet.name}</strong>，${characterSheet.occupation}，${characterSheet.age} 歲</div>
        
    `)
}