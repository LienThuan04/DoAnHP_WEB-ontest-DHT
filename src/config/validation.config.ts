import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";

export const validationConfig: (app: INestApplication) => void = (app: INestApplication) => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, //tự động loại bỏ các thuộc tính không được định nghĩa trong DTOs
            forbidNonWhitelisted: true, //nếu có thuộc tính không được định nghĩa trong DTO thì sẽ ném ra lỗi
            transform: true, //tự động chuyển đổi payload thành các instance của lớp DTO

            exceptionFactory: (errors) => { // tuyến bố một factory để tạo ra lỗi tùy chỉnh khi validation thất bại
                // Format validation errors
                const formattedErrors = errors.map((error) => ({
                    field: error.property, // Tên của trường bị lỗi
                    messages: Object.values(error.constraints || {}), // Các thông báo lỗi liên quan đến trường đó
                }));
                throw new BadRequestException({ // Trả về một đối tượng lỗi có cấu trúc rõ ràng
                    statusCode: 400, // Mã lỗi HTTP
                    message: 'Validation failed', // Thông báo lỗi chung
                    errors: formattedErrors
                });
            },
        }),
    );
}