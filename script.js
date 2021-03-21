
let dataRaw = 0;
let arr = [];
const h = 500;
let timestamps = [];

(async function(){
    let symbolsRaw = await axios.get(`https://fapi.binance.com/fapi/v1/exchangeInfo`)
    let symbols = [];
    symbolsRaw.data.symbols.forEach(elem=>{
        if(elem.contractType == "PERPETUAL") symbols.push(elem.symbol)
    })

    for(let i = 0; i < symbols.length; i++){
        $('#symbols').append(`<option value="${symbols[i]}">${symbols[i]}</option>`);
    }
})()

async function temp(){
    //$('#symbols').children().remove()

    let timeframe = $('#timeframe').val()
    let symbol = $('#symbols').val();
    dataRaw = await axios.get(`https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${timeframe}&limit=500`)

    let data = [];
    dataRaw.data.forEach(elem => {
        arr.push(parseFloat(elem.sumOpenInterest).toFixed(0))
        let date = new Date(elem.timestamp);
        timestamps.push(date.getHours()+ ":" +date.getMinutes()+"/"+date.getDate());
    });
    let min = Math.min.apply(null, arr) * 0.99;
    let x = 0;
    dataRaw.data.forEach((elem, i) => {
        x = parseFloat(elem.sumOpenInterest).toFixed(0) - min;
        data.push({interest: x, time: timestamps[i]});
    });
    remove()
    graph(data)
    arr= [];
    timestamps = [];
}

(async function () {
    await temp()
})()

$('#symbols').on('change', async function() {
    await temp()
});

$('#timeframe').on('change', async function() {
    await temp()
});

function graph(data){
    const svg = d3.select('svg')
    .attr('height', h)

    svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr("x", (d, i) => i * 3)
    .attr("y", (d, i) => h - 3*d.interest/(Math.max.apply(null, arr)/h*2)-15)
    .attr("width", 2,5)
    .attr("height", (d, i) => 3*d.interest/(Math.max.apply(null, arr)/h*2))
    .attr("fill", "navy")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

    function handleMouseOver(d, i) {
        d3.select(this).attr('fill', 'orange');
    
        svg.append("text")
        .attr('x', (dot, i) => d.layerX)
        .attr('y', h - 2)
        .attr( "id", "t")
        .text(()=>d.path[0].__data__.time );
      }
    
    function handleMouseOut(d, i) {
        d3.select(this).attr('fill', 'navy');
        d3.select("#t").remove();
    }
}

function remove(){
    $('rect').remove()
}