<style>
    #page-footer { display: none }
    .bg-gradient-teal { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); }
    .border-teal { border-color: #14b8a6 !important; }
    .btn-teal { background-color: #0d6efd; color: #fff; box-shadow: 0 6px 18px rgba(13,110,253,0.12); border: none; }
    .btn-teal:hover { background-color: #0b5ed7 }
    .block-rounded { border-radius: .5rem }
    .form-textarea-large { min-height: 140px; }
</style>

<div class="content py-5 bg-light">
    <div class="block block-rounded shadow-lg border-start border-5 border-teal">
        <div class="block-header bg-gradient-teal text-white p-4 d-flex justify-content-between align-items-center">
            <?php
                $title = "";
                if ($data["Action"] == "create") {
                        $title = "Tạo mới và gửi thông báo";
                } elseif ($data["Action"] == "update") {
                        $title = "Cập nhật thông báo";
                }
            ?>
            <h3 class="block-title mb-0"><i class="fa fa-paper-plane me-2"></i> <?php echo $title ?></h3>
        </div>

        <div class="block-content p-4">
            <form class="row g-0 flex-md-grow-1 form-taothongbao" onsubmit="return false;">
                <div class="col-12">
                    <div class="mb-4">
                        <label for="name-exam" class="form-label fw-semibold">Nội dung thông báo</label>
                        <textarea class="form-control form-textarea-large" id="name-exam" name="name-exam" placeholder="Nhập nội dung thông báo"></textarea>
                    </div>

                    <div class="mb-4">
                        <div class="block block-rounded border">
                            <div class="block-header block-header-default d-flex align-items-center justify-content-between">
                                <h3 class="block-title mb-0">Thông báo cho</h3>
                                <div class="block-option">
                                      <select class="js-select2 form-select border-teal" id="nhom-hp" name="nhom-hp" style="width: 300px;" data-placeholder="Chọn nhóm học phần thông báo..." <?php if ($data["Action"] == "update") { echo "disabled"; }?>>
                                    </select>
                                </div>
                            </div>

                            <div class="block-content pb-3">
                                <div class="row" id="list-group" name="list-group">
                                    <div class="text-center fs-sm"><img style="width:100px" src="./public/media/svg/empty_data.png" alt=""></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <?php if ($data["Action"] == "create") { ?>
                            <button type="submit" class="btn btn-teal px-4 py-2" id="btn-send-announcement"><i class="fa fa-plus me-1"></i> Gửi thông báo</button>
                        <?php } elseif ($data["Action"] == "update") { ?>
                            <button type="submit" class="btn btn-teal px-4 py-2" id="btn-update-announce"><i class="fa fa-save me-1"></i> Cập nhật thông báo</button>
                        <?php } ?>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>