    // 目标：从单溶质体系出发，增加一种强酸或者强碱，用来调节体系pH，得到平衡状态下的浓度分布。并绘图展示分布系数图。
// workflow:增加强酸/强碱（增加“体系酸度”选项） -> 增加新的物种 -> 计算新体系下的各粒子浓度，计算分布系数 -> 绘制分布系数图
// 展望：把pH设置改成滑块，动态调整pH值，观察分布系数的变化
// gpt已经生成了相关代码，但是不知道怎么整合，等明天有份额了再问
let chartInstance=null;



function generateInputs(){

    const n=parseInt(document.getElementById("n").value);

    const container=document.getElementById("ka_container");

    container.innerHTML="";

    const mode=document.getElementById("mode").value;

    for(let i=1;i<=n;i++){

        let label=document.createElement("label");

        label.innerText=mode+i+": ";

        let input=document.createElement("input");

        input.id="k"+i;

        container.appendChild(label);

        container.appendChild(input);

        container.appendChild(document.createElement("br"));
    }

}



function distributionCoefficients(pH,Ka){

    const n=Ka.length;

    const H=Math.pow(10,-pH);

    let Kprod=[1];

    for(let i=1;i<=n;i++){

        Kprod[i]=Kprod[i-1]*Ka[i-1];

    }

    let denom=0;

    for(let j=0;j<=n;j++){

        denom+=Kprod[j]*Math.pow(H,n-j);

    }

    let alpha=[];

    for(let i=0;i<=n;i++){

        alpha[i]=(Kprod[i]*Math.pow(H,n-i))/denom;

    }

    return alpha;

}



function generateData(Ka){

    let pH=[];

    let curves=[];

    const n=Ka.length;

    for(let i=0;i<=n;i++){

        curves[i]=[];

    }

    for(let value=0;value<=14;value+=0.05){

        let alpha=distributionCoefficients(value,Ka);

        pH.push(value);

        for(let i=0;i<=n;i++){

            curves[i].push(alpha[i]);

        }

    }

    return {pH,curves};

}



function speciesNames(n){

    let names=[];

    for(let i=0;i<=n;i++){

        let Hcount=n-i;

        let charge=i;

        let name="";

        if(Hcount>0){

            name+="H"+(Hcount>1?Hcount:"");

        }

        name+="A";

        if(charge>0){

            name+=charge==1?"⁻":charge+"⁻";

        }

        names.push(name);

    }

    return names;

}



function plotDistribution(Ka,pKaValues){

    const data=generateData(Ka);

    const pH=data.pH;

    const curves=data.curves;

    const names=speciesNames(Ka.length);

    let datasets=[];

    for(let i=0;i<names.length;i++){

        datasets.push({

            label:names[i],

            data:pH.map((v,index)=>({x:v,y:curves[i][index]})),

            fill:false,

            tension:0.1

        });

    }



    if(chartInstance){

        chartInstance.destroy();

    }



    let annotations={};



    pKaValues.forEach((pka,index)=>{

        annotations["line"+index]={

            type:'line',

            xMin:pka,

            xMax:pka,

            borderColor:'black',

            borderWidth:1,

            label:{

                display:true,

                content:"pKa"+(index+1),

                position:'start'

            }

        };

    });



    chartInstance=new Chart(document.getElementById("chart"),{

        type:'line',

        data:{datasets:datasets},

        options:{

            responsive:true,

            scales:{

                x:{

                    type:'linear',

                    min:0,

                    max:14,

                    title:{

                        display:true,

                        text:"pH"

                    },

                    ticks:{

                        stepSize:1

                    }

                },

                y:{

                    min:0,

                    max:1,

                    title:{

                        display:true,

                        text:"Distribution coefficient α"

                    }

                }

            },

            plugins:{

                annotation:{

                    annotations:annotations

                }

            }

        }

    });

}



function run(){

    const n=parseInt(document.getElementById("n").value);

    const mode=document.getElementById("mode").value;

    let Ka=[];

    let pKaValues=[];

    for(let i=1;i<=n;i++){

        let value=parseFloat(document.getElementById("k"+i).value);

        if(mode==="Ka"){

            Ka.push(value);

            pKaValues.push(-Math.log10(value));

        }

        else{

            pKaValues.push(value);

            Ka.push(Math.pow(10,-value));

        }

    }

    plotDistribution(Ka,pKaValues);

}