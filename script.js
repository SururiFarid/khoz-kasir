/* ===================
   LOGIN CHECK
=================== */

if(localStorage.getItem("login") !== "true"){

    window.location.href =
        "login.html";
}

document.addEventListener("DOMContentLoaded",()=>{

    const kasir =
        localStorage.getItem("namaKasir") ||
        "-";

    document.getElementById("namaKasir").value =
        kasir;
});

let keranjang = [];

/* =========================
   TEMA GELAP / TERANG
========================= */

function setTheme(theme){

    if(theme === "dark"){
        document.body.classList.add("dark");

        document.getElementById("themeToggle").innerHTML =
            "☀️ Mode Terang";
    }else{
        document.body.classList.remove("dark");

        document.getElementById("themeToggle").innerHTML =
            "🌙 Mode Gelap";
    }

    localStorage.setItem("theme", theme);
}

document.addEventListener("DOMContentLoaded", ()=>{

    const savedTheme =
        localStorage.getItem("theme") || "light";

    setTheme(savedTheme);

    document
        .getElementById("themeToggle")
        .addEventListener("click", ()=>{

            const isDark =
                document.body.classList.contains("dark");

            setTheme(isDark ? "light" : "dark");
        });
});

/* JAM REALTIME */
function updateDateTime(){
    const now = new Date();

    document.getElementById("datetime").innerHTML =
        now.toLocaleDateString("id-ID", {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }) + " | " + now.toLocaleTimeString("id-ID");
}

setInterval(updateDateTime,1000);
updateDateTime();

/* FORMAT RUPIAH */
function formatRupiah(num){
    return num.toLocaleString("id-ID");
}

/* TAMBAH BARANG */
function tambahBarang(){

    let nama = document.getElementById("namaBarang").value;
    let harga = parseInt(document.getElementById("hargaBarang").value);
    let qty = parseInt(document.getElementById("qtyBarang").value);

    if(!nama || harga <= 0 || qty <= 0){
        alert("Isi data dengan benar!");
        return;
    }

    keranjang.push({nama,harga,qty});

    document.getElementById("namaBarang").value="";
    document.getElementById("hargaBarang").value="";
    document.getElementById("qtyBarang").value="";

    render();
}

/* RENDER */
function render(){

    let tbody = document.getElementById("cartBody");
    tbody.innerHTML="";

    let total = 0;

    keranjang.forEach((item,i)=>{
        let sub = item.harga * item.qty;
        total += sub;

        tbody.innerHTML += `
        <tr>
            <td>${item.nama}</td>
            <td>${item.qty}</td>
            <td>Rp ${formatRupiah(item.harga)}</td>
            <td>Rp ${formatRupiah(sub)}</td>
            <td>
                <class="btn-delete" onclick="hapus(${i})">X</class=>
            </td>
        </tr>`;
    });

    document.getElementById("totalBelanja").innerText =
        formatRupiah(total);

    hitungKembalian();
}

/* HAPUS */
function hapus(i){
    keranjang.splice(i,1);
    render();
}

/* KEMBALIAN */
function hitungKembalian(){

    let total = keranjang.reduce((a,b)=>a+(b.harga*b.qty),0);
    let bayar = parseInt(document.getElementById("uangDibayar").value) || 0;

    let kembali = bayar - total;

    document.getElementById("uangKembalian").value =
        "Rp " + formatRupiah(kembali > 0 ? kembali : 0);
}

/* CETAK STRUK */
function selesaiDanCetak(){

    if(keranjang.length === 0){
        alert("Keranjang kosong!");
        return;
    }

    let total = keranjang.reduce((a,b)=>a+(b.harga*b.qty),0);
    let bayar = parseInt(document.getElementById("uangDibayar").value) || 0;

    if(bayar < total){
        alert("Uang kurang!");
        return;
    }

    let kembali = bayar - total;

    let waktu = new Date();

    let noTransaksi =
        "ADMN" +
        Date.now().toString().slice(-8);

    let namaKasir = 
        document.getElementById("namaKasir").value;

     simpanRiwayat({

        timestamp: Date.now(),

        noTransaksi: noTransaksi,

        tanggal:
            waktu.toLocaleDateString("id-ID") +
            " " +
            waktu.toLocaleTimeString("id-ID"),

        kasir: namaKasir,

        barang: [...keranjang],

        total: total,

        bayar: bayar,

        kembali: kembali
    });

    let daftar = "";

    keranjang.forEach(item=>{
        daftar += `
        <tr>
            <td>${item.nama}</td>
            <td>${item.qty}</td>
            <td>Rp ${formatRupiah(item.harga * item.qty)}</td>
        </tr>`;
    });

    const struk = `
    <html>
    <head>
    <style>
        @page{
            size:58mm auto;
            margin:0;
         }

         body{
             width:58mm;
             margin:0;
             padding:2mm;
             font-family:monospace;
             font-size:11px;
             text-transform:uppercase;
         }

        h2{
            text-align:center;
            margin-bottom:5px;
        }

        .alamat{
            text-align:center;
            font-size:11px;
            margin-bottom:25px;
        }

        .info{
            text-align:left;
            margin-bottom:25px;
            line-height:1.5;
        }

        table{
            width:100%;
            border-collapse:collapse;
            text-align:center;
        }

        td,th{
            padding:5px;
            border-bottom:1px dashed #999;
            text-align:center;
        }

        .spacer{
            height:25px;
        }

        .total{
            margin-top:20px;
            font-weight:bold;
            text-align:right;
        }
    </style>
    </head>

    <body>

        <h2>TOKO KHOZ</h2>

        <div class="alamat">
            Jl. Jatiwayang<br>
            Ngunut, Tulungagung, Jawa Timur<br>
        </div>

       <div class="info">
            NO TRANSAKSI : ${noTransaksi}<br>
            KASIR        : ${namaKasir}<br>
            TANGGAL      : ${waktu.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })}<br>
            JAM          : ${waktu.toLocaleTimeString("id-ID")}
        </div>

        <hr>

        <table>
            <tr>
                <th>Barang</th>
                <th>Qty</th>
                <th>Total</th>
            </tr>

            ${daftar}
        </table>

        <div class="spacer"></div>

        <hr>

        <div class="total">
            <p>Total    : Rp ${formatRupiah(total)}</p>
            <p>Bayar    : Rp ${formatRupiah(bayar)}</p>
            <p>Kembali  : Rp ${formatRupiah(kembali)}</p>
        </div>

        <hr>

        <center>Terima Kasih, Selamat Belanja Kembali</center>

    </body>
    </html>
    `;

    let win = window.open("", "", "width=400,height=700");
    win.document.write(struk);
    win.document.close();
    win.print();

    keranjang = [];
    render();

    document.getElementById("uangDibayar").value="";
    document.getElementById("uangKembalian").value="";
}

function logout(){

    if(confirm("Yakin logout?")){

        localStorage.removeItem("login");
        localStorage.removeItem("namaKasir");

        window.location.href =
            "login.html";
    }
}

function getRiwayat(){

    return JSON.parse(
        localStorage.getItem("riwayatTransaksi")
    ) || [];
}

function simpanRiwayat(data){

    let riwayat = getRiwayat();

    riwayat.unshift(data);

    const tujuhHari =
        7 * 24 * 60 * 60 * 1000;

    const sekarang =
        Date.now();

    riwayat = riwayat.filter(item => {

        return sekarang -
        item.timestamp <
        tujuhHari;

    });

    localStorage.setItem(
        "riwayatTransaksi",
        JSON.stringify(riwayat)
    );

    tampilRiwayat();
}

function tampilRiwayat(){

    const tbody =
        document.getElementById("historyBody");

    if(!tbody) return;

    tbody.innerHTML = "";

    const riwayat =
        getRiwayat();

    riwayat.forEach((trx,index)=>{

        tbody.innerHTML += `
        <tr>
            <td>${trx.noTransaksi}</td>
            <td>${trx.tanggal}</td>
            <td>${trx.kasir}</td>
            <td>Rp ${formatRupiah(trx.total)}</td>

            <td>
                <button
                    onclick="lihatDetail(${index})"
                    class="btn-print">
                    Detail
                </button>
            </td>

            <td>
                <button
                    onclick="hapusRiwayat(${index})"
                    class="btn-delete">
                    Hapus
                </button>
            </td>
        </tr>`;
    });

}

function lihatDetail(index){

    const riwayat =
        getRiwayat();

    const trx =
        riwayat[index];

    let barang = "";

    trx.barang.forEach(item=>{

        barang += `
        <tr>
            <td>${item.nama}</td>
            <td>${item.qty}</td>
            <td>Rp ${formatRupiah(item.harga)}</td>
            <td>Rp ${formatRupiah(item.harga * item.qty)}</td>
        </tr>`;
    });

    const detail = `
    <html>
    <head>
    <title>Detail Transaksi</title>

    <style>
    body{
        font-family:Segoe UI;
        padding:20px;
    }

    table{
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
    }

    td,th{
        border:1px solid #ddd;
        padding:8px;
        text-align:center;
    }
    </style>
    </head>

    <body>

    <h2>Detail Transaksi</h2>

    <p><b>No Transaksi:</b> ${trx.noTransaksi}</p>
    <p><b>Tanggal:</b> ${trx.tanggal}</p>
    <p><b>Kasir:</b> ${trx.kasir}</p>

    <table>
        <tr>
            <th>Barang</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Total</th>
        </tr>

        ${barang}
    </table>

    <br>

    <p><b>Total :</b> Rp ${formatRupiah(trx.total)}</p>
    <p><b>Bayar :</b> Rp ${formatRupiah(trx.bayar)}</p>
    <p><b>Kembali :</b> Rp ${formatRupiah(trx.kembali)}</p>

    </body>
    </html>
    `;

    const win =
        window.open("","","width=800,height=600");

    win.document.write(detail);
}

document.addEventListener("DOMContentLoaded",()=>{

    tampilRiwayat();
});

function hapusRiwayat(index){

    if(!confirm("Hapus transaksi ini?")){
        return;
    }

    let riwayat =
    JSON.parse(
        localStorage.getItem(
            "riwayatTransaksi"
        )
    ) || [];

    riwayat.splice(index,1);

    localStorage.setItem(
        "riwayatTransaksi",
        JSON.stringify(riwayat)
    );

    tampilRiwayat();
}

function hapusSemuaRiwayat(){

    if(!confirm(
        "Yakin ingin menghapus seluruh riwayat?"
    )){
        return;
    }

    localStorage.removeItem(
        "riwayatTransaksi"
    );

    tampilRiwayat();
}
