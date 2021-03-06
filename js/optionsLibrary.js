function cndf(x){
    if(x < -5){
        return 0;
    }
    if (x > 5){
        return 1;
    }
    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // Save the sign of x
    var sign = 1;
    if (x < 0)
        sign = -1;
    x = Math.abs(x) / Math.sqrt(2.0);

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
}

function cndfInv(p) {
    var a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    var a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    var b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    var b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03;
    var c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
    var c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03;
    var d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;
    var p_low = 0.02425, p_high = 1 - p_low;
    var q, r;
    var icndf;

    if ((p < 0) || (p > 1))
    {
        icndf = null;
    }
    else if (p < p_low)
    {
        q = Math.sqrt(-2 * Math.log(p));
        icndf = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    else if (p <= p_high)
    {
        q = p - 0.5;
        r = q * q;
        icndf = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    }
    else
    {
        q = Math.sqrt(-2 * Math.log(1 - p));
        icndf = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }

    return icndf;
}

function ndf(x){
    return 1 / Math.sqrt(2 * Math.PI) * Math.exp(-1 * x * x / 2);
}

function loss(a,b){
    //return Math.Abs(Math.Sqrt(a)-Math.Sqrt(b));
    return a - b;
}

function d1(p, x, t, q, r, sigma){
    return (Math.log(p / x) + t * (r - q + (sigma * sigma) / 2)) / (sigma * Math.sqrt(t));
}

function d2(p, x, t, q, r, sigma){
    return (Math.log(p / x) + t * (r - q + (sigma * sigma) / 2)) / (sigma * Math.sqrt(t)) - (sigma * Math.sqrt(t));
}

function getRangeOfPrices(priceUnderlying, percentInterval, numOfIntervals, initialCost){
    var rangeOfPrices = {}
    min = priceUnderlying/Math.pow(1+(percentInterval/100), Math.floor(numOfIntervals/2))
    max = priceUnderlying*Math.pow(1+(percentInterval/100), Math.floor(numOfIntervals/2))
    for(i = min; i < max * (1+(percentInterval/200)); i *= (1+(percentInterval/100))){
        rangeOfPrices[i] = initialCost
    } 
    return rangeOfPrices
}

//GREEKS
function delta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv));
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * (cndf(d1(priceUnderlying, strike, t, divYield, r, iv)) - 1);
    }
}

function gamma(t, priceUnderlying, strike, isLong, r, divYield, iv){
    return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (priceUnderlying * iv * Math.sqrt(t));
}

function theta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) +
        (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv))) -
        (r * strike * Math.exp(-1 * r * t) * ndf(d2(priceUnderlying, strike, t, divYield, r, iv)))
        ) / 365;
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) -
        (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(-1 * d1(priceUnderlying, strike, t, divYield, r, iv))) -
        (r * strike * Math.exp(-1 * r * t) * ndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv)))
        ) / 365;
    }
}

function vega(t, priceUnderlying, strike, isLong, r, divYield, iv){
    return (isLong ? 1 : -1) * priceUnderlying / 100 * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv));
}

function rho(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * t / 100 * Math.exp(-1 * r * t) * strike * cndf(d2(priceUnderlying, strike, t, divYield, r, iv));                    
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * t / -100 * Math.exp(-1 * r * t) * strike * cndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv));     
    }
}

function calculateGreeks(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    greeks = {}
    greeks.delta = delta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    greeks.gamma = gamma(t, priceUnderlying, strike, isLong, r, divYield, iv)
    greeks.theta = theta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    greeks.vega = vega(t, priceUnderlying, strike, isLong, r, divYield, iv)
    greeks.rho = rho(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    return greeks
}

//IV and Price
function calculateIV(t, priceOfOption, priceUnderlying, strike, isCall, r, divYield){
    var iv = Math.sqrt(Math.PI * 2 / t) * priceOfOption/priceUnderlying 
    var priceOfOptionTheoretical, vega;
    priceOfOptionTheoretical = calculateOptionsPrice(t, priceUnderlying, strike, isCall, true,  r, divYield, iv)
    stopTrying = 0
    while (loss(priceOfOption, priceOfOptionTheoretical) > 0.000005 || loss(priceOfOption, priceOfOptionTheoretical) < -0.000005){
        if(loss(priceOfOption, priceOfOptionTheoretical) > priceOfOption / 10){
            if (priceOfOption > priceOfOptionTheoretical)
            {
                iv += 0.075 + Math.random()/15;
            }
            if (priceOfOption < priceOfOptionTheoretical)
            {
                iv -= 0.075 + Math.random()/15;
            }
        }
        else{
            vega = priceUnderlying * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv))
            iv = iv + (loss(priceOfOption, priceOfOptionTheoretical) / vega)
        }
        priceOfOptionTheoretical = calculateOptionsPrice(t, priceUnderlying, strike, isCall, true, r, divYield, iv)
        stopTrying++
        if(stopTrying > 100){
            iv = Math.sqrt(Math.PI * 2 / t) * priceOfOption/priceUnderlying 
            if((isCall ? priceOfOption + strike < priceUnderlying : priceOfOption - strike > priceUnderlying) && (isCall ? strike/priceUnderlying < 0.80 : strike/priceUnderlying > 1.25)){
                if(isCall){
                    d = cndfInv(0.999/(Math.exp(-divYield * t)))
                }
                else if(!isCall){
                    d = cndfInv(-0.999/(Math.exp(-divYield * t)) + 1)
                }
                console.log('bruh')
                return Math.abs((Math.sqrt(t*(2*Math.log(priceUnderlying/priceOfOption) + Math.pow(d,2) - 2*divYield*t + 2*r*t))-d*Math.sqrt(t))/t)
            }
            break;   
        }
    }
    if (iv < 0){
        return null //INVALID ID
    }
    return iv
}

function calculateOptionsPrice(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    var priceOfOptionTheoretical
    if(isCall){
        priceOfOptionTheoretical = priceUnderlying * Math.exp(-1* divYield* t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv)) - strike * Math.exp(-1 * r * t) * cndf(d2(priceUnderlying, strike, t, divYield, r, iv))
    }
    else if(!isCall){
        priceOfOptionTheoretical = -1 * priceUnderlying * Math.exp(-1* divYield* t) * cndf(-1 * d1(priceUnderlying, strike, t, divYield, r, iv)) + strike * Math.exp(-1 * r * t) * cndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv))
    }
    if(!isLong){
        priceOfOptionTheoretical *= -1
    }
    return priceOfOptionTheoretical
}

function calculateProfitAtExpiry(initialCost, priceUnderlying, strike, isCall, isLong){
    if (isCall)
    {
        if (isLong)
        {
            return Math.max(((-1 * initialCost) + (priceUnderlying - strike)), (-1 * initialCost));
        }
        else if (!isLong)
        {
            return Math.min((initialCost - (priceUnderlying - strike)), initialCost);                             
        }
    }
    else if (!isCall)
    {
        if (isLong)
        { 
            return Math.max(((-1 * initialCost) + (-1 * priceUnderlying + strike)), (-1 * initialCost));
        }
        else if (!isLong)
        {
            return Math.min((initialCost - (-1 * priceUnderlying + strike)), initialCost);
        }
    }
}
