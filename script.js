
    document.getElementById('kirim-wa').addEventListener('click', function() {
        var nama = document.getElementById('nama').value;
        var email = document.getElementById('email').value;
        var pesan = document.getElementById('pesan').value;

        if(nama && email && pesan){
            var text = "Halo Banana King%0ASaya ingin memberikan saran.%0ANama: " + encodeURIComponent(nama) + "%0AEmail: " + encodeURIComponent(email) + "%0APesan: " + encodeURIComponent(pesan);
            window.open('https://wa.me/6281234567890?text=' + text, '_blank');
        } else {
            alert("Mohon isi semua kolom sebelum mengirim.");
        }
    });

