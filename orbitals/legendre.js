function fact(n)
{
    if (n <= 1)
        return 1

    for (var i = n - 1; i >= 1; i--)
        n *= i;

    return n
}

function assoc_legendre(l, m, x)
{
    l = Math.floor(l);
    m = Math.floor(m);

    if (x > 1 || x < -1 || l < 0 || m > l)
        return 0;

    if (m === l)
        return (Math.pow(-1, m) * fact(2*m) / (Math.pow(2, m) * fact(m)) * Math.pow(1 - x*x, m/2))

    return (x * (2*l - 1) * assoc_legendre(l-1, m, x) - (l + m - 1) * assoc_legendre(l-2, m, x)) / (l - m)
}

function N(l, m)
{
    return Math.sqrt((2*l + 1)/2 * fact(l-m) / fact(l+m));
}

function Y(l, m, theta, phi)
{
    var a = 1 / Math.sqrt(2 * Math.PI) * N(l, Math.abs(m)) * assoc_legendre(l, Math.abs(m), Math.cos(theta))
    if(m >= 0)
        return a * Math.cos(m * phi)
    else
        return a * Math.sin(Math.abs(m) * phi)
}