<script src="https://cdn.ckeditor.com/ckeditor5/41.0.0/classic/ckeditor.js"></script>
<script src="https://unpkg.com/idb@7/build/umd.js"></script>
<style>
        #list-question {
            display: block !important;
            visibility: visible !important;
            height: auto !important;
            background-color: #f8f9fa !important;
            padding: 20px;
            border-radius: 8px;
        }
        .question {
            display: block !important;
            opacity: 1 !important;
            margin-bottom: 15px;
        }
        .test-ans {
            display: flex !important;
            gap: 10px;
        }
        .nav {
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .nav-center {
            font-size: 1.1rem;
        }
        .nav-time {
            font-size: 1rem;
            color: #333;
        }
        .btn-hero {
            transition: all 0.3s ease;
        }
        .btn-hero:hover {
            transform: translateY(-1px);
        }
       .sidebar-answer {
    position: sticky;
    top: 120px;
    max-height: calc(100vh - 150px);
    overflow-y: auto;

    width: 90%;        /* thu nhỏ -> căn giữa trong col-4 */
}

        .mt-6 {
            margin-top: 5rem !important;
        }
        .image-preview-container {
  min-height: 100px;
  border: 2px dashed #dee2e6;
  background-color: #fafafa;
  transition: all 0.3s;
}

.image-preview-container:not(:empty) {
  border-style: solid;
  background-color: #fff;
}

.no-image-text {
  color: #999;
  font-style: italic;
}

.img-thumbnail {
  transition: transform 0.2s ease;
}

.img-thumbnail:hover {
  transform: scale(1.05);
  z-index: 10;
}
.hover-lift { transition: all 0.3s; }
.hover-lift:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important; }
.option-card { background: #f8f9fa; min-height: 80px; }
.bg-gradient-primary { background: linear-gradient(135deg, #007bff, #0056b3); }
.reading-passage { border-left: 6px solid #ffc107; }
.card { border-radius: 16px !important; overflow: hidden; }
.answer-bar label { font-size: 1.2rem; min-width: 60px; height: 50px; display: inline-flex; align-items: center; justify-content: center; }
.image-preview img { max-height: 160px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

.nav-custom .container {
    padding-right: 0 !important;
}

#btn-nop-bai {
    border-radius: 0 8px 8px 0;  /* bo góc bên trái thôi, bên phải vuông */
}


    .nav-custom {
    z-index: 999;
}

.nav-left {
    width: 50%;
}

.nav-right {
    width: auto; 
}


.text-cyan {
    color: darkcyan;
}

.text-red {
    color: darkred;
}

/* Responsive cho tablet/mobile */
@media (max-width: 768px) {
    .nav-left,
    .nav-right {
        width: auto;
    }

    .nav-center {
        position: static !important;
        transform: none !important;
        margin-top: 8px;
    }

    nav .container {
        flex-direction: column;
        gap: 10px;
    }
}

/* Mobile nhỏ hơn 500px */
@media (max-width: 500px) {
    #btn-nop-bai {
        padding: 6px 12px;
        font-size: 14px;
    }

    .btn-group button {
        font-size: 13px;
    }
} 


    </style>
</head>
<body>
<nav class="nav-custom border-bottom bg-white position-fixed top-0 w-100 shadow-sm">
    <div class="container d-flex justify-content-between align-items-center py-3 position-relative">

        <!-- LEFT: TIME -->
         <div class="nav-left d-flex align-items-center">
    <div class="fs-5 text-dark">
        <i class="far fa-clock me-2"></i>Thời gian:
        <span id="timer" class="fw-bold">00:00:00</span>
    </div>
</div>

       

        <!-- CENTER: INFO -->
        <div class="nav-center position-absolute start-50 translate-middle-x text-center">

    <div class="fs-5">
        <span class="fw-bold">Họ và Tên:</span>
        <span class="text-red"><?php echo $_SESSION['user_name']; ?></span>
    </div>

    <div class="fs-6 mt-1">
        <span class="fw-bold">MSSV:</span>
        <span class="text-cyan"><?php echo $_SESSION['user_id']; ?></span>
    </div>

  <div class="fs-6 mt-1 text-dark"> 
    <span class="fw-bold">Môn:</span>
    <span id="ten-mon" class="text-dark">
        <?php echo $data["Test"]["tenmon"] ?? "Không rõ"; ?>
    </span>

    &nbsp; | &nbsp;

    <span class="fw-bold">Tên Đề:</span>
    <span id="ten-de" class="text-dark">
        <?php echo $data["Test"]["tendethi"] ?? "Không rõ"; ?>
    </span>
</div>


</div>


        <!-- RIGHT: MODE + SUBMIT -->
        <div class="nav-right d-flex align-items-center gap-3 ms-auto">

            <div class="text-center me-2">
                <div class="fw-bold text-secondary" style="font-size: 0.85rem; margin-bottom: 4px;">
                    Chế độ hiển thị
                </div>
                <div class="btn-group" role="group">
                    <button type="button" id="mode-full" class="btn btn-outline-primary btn-sm active">
                        <i class="fas fa-th-large"></i> Full
                    </button>
                    <button type="button" id="mode-one" class="btn btn-outline-success btn-sm">
                        <i class="fas fa-file-alt"></i> Từng câu
                    </button>
                </div>
            </div>

            <!-- Submit (sát mép phải) -->
           <button id="btn-nop-bai" class="btn btn-danger btn-lg shadow-sm rounded-pill">
    <i class="far fa-file-lines me-1"></i> Nộp bài
</button>

        </div>

    </div>
</nav>


<div class="container mb-5 mt-6" id="dethicontent" 
     data-id="<?php echo $data['Made']?>" 
     data-user="<?php echo $_SESSION['user_id'] ?>">

    <div class="row">

        <div class="col-8" id="list-question">
            <!-- Question content goes here -->
        </div>

        <div class="col-4 d-flex justify-content-center">
            <div class="bg-white p-3 rounded border h-100 sidebar-answer">
                <ul class="answer">
                    <!-- Answer list goes here -->
                </ul>
            </div>
        </div>

    </div>
</div>

