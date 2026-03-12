// 计算多元非线性方程组的数值解
// 问题已解决
// 目标是pH值误差在0.01以内，浓度误差在1%以内

function equations(c, n, k, c0, kw) {

    let eq = [];

    let ions = c.slice(0, n);
    let HA = c[n];
    let H_plus = c[n+1];
    let OH_minus = c[n+2];

    // 电离平衡
    for (let i = 0; i < n; i++) {

        if (i === 0) {
            eq.push(k[i] * HA - H_plus * ions[i]);
        } else {
            eq.push(k[i] * ions[i-1] - H_plus * ions[i]);
        }

    }

    // 物料守恒
    let sumIons = ions.reduce((a,b)=>a+b,0);
    eq.push(sumIons + HA - c0);

    // 电荷守恒
    eq.push(H_plus - sumIons - OH_minus);

    // 水电离
    eq.push(H_plus * OH_minus - kw);

    return eq;
}

function solveSystem(func, guess, args) {

    let x = guess.slice();
    let n = x.length;

    let maxIter = 200;
    let tol = 1e-12;

    for (let iter = 0; iter < maxIter; iter++) {

        let f = func(x, ...args);

        // 计算残差范数
        let norm = Math.sqrt(f.reduce((a,b)=>a+b*b,0));
        if (norm < tol) {
            return x;
        }

        // 计算 Jacobian (数值微分)
        let J = [];
        let h = 1e-8;

        for (let i = 0; i < n; i++) {
            J.push(new Array(n).fill(0));
        }

        for (let j = 0; j < n; j++) {

            let xh = x.slice();
            xh[j] += h;

            let fh = func(xh, ...args);

            for (let i = 0; i < n; i++) {
                J[i][j] = (fh[i] - f[i]) / h;
            }
        }

        // 求解 J * dx = f
        let dx = solveLinearSystem(J, f);

        // 更新变量
        for (let i = 0; i < n; i++) {
            x[i] = x[i] - dx[i];

            // 防止负浓度
            if (x[i] < 1e-20) x[i] = 1e-20;
        }
    }

    console.warn("Solver did not fully converge");
    return x;
}


// 高斯消元求解线性方程组
function solveLinearSystem(A, b) {

    let n = b.length;

    // 复制矩阵
    let M = A.map(row => row.slice());
    let x = new Array(n);
    let B = b.slice();

    // 前向消元
    for (let k = 0; k < n; k++) {

        // 选择主元
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) {
                maxRow = i;
            }
        }

        // 交换行
        [M[k], M[maxRow]] = [M[maxRow], M[k]];
        [B[k], B[maxRow]] = [B[maxRow], B[k]];

        // 消元
        for (let i = k + 1; i < n; i++) {

            let factor = M[i][k] / M[k][k];

            for (let j = k; j < n; j++) {
                M[i][j] -= factor * M[k][j];
            }

            B[i] -= factor * B[k];
        }
    }

    // 回代
    for (let i = n - 1; i >= 0; i--) {

        let sum = B[i];

        for (let j = i + 1; j < n; j++) {
            sum -= M[i][j] * x[j];
        }

        x[i] = sum / M[i][i];
    }

    return x;
}

function computeSolution(n, c0, kw, k) {

    let approx_H = (n === 1) ? Math.sqrt(k[0]*c0) : c0/2;

    let init_guess = [];

    for (let i=0;i<n;i++){
        init_guess.push(approx_H);
    }

    init_guess.push(c0 - approx_H);
    init_guess.push(approx_H);
    init_guess.push(kw/approx_H);

    let solution = solveSystem(equations, init_guess, [n,k,c0,kw]);

    return solution;
}

