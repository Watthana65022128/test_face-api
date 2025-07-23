// ไลบรารี face-api.js สำหรับการทำงานกับ Facial Recognition
import * as faceapi from 'face-api.js';

// ตัวแปรเก็บสถานะการโหลด ML models
let modelsLoaded = false;

/**
 * ฟังก์ชันสำหรับโหลด Machine Learning Models ที่จำเป็นสำหรับ Face Recognition
 * 
 * Models ที่โหลด:
 * 1. TinyFaceDetector - ตรวจจับใบหน้าในภาพ (เร็วแต่ความแม่นยำปานกลาง)
 * 2. FaceLandmark68Net - หาจุดสำคัญบนใบหน้า (68 จุด เช่น ตา จมูก ปาก)
 * 3. FaceRecognitionNet - สกัดข้อมูลใบหน้าเป็น descriptor สำหรับเปรียบเทียบ
 * 
 * @returns Promise<boolean> - true หากโหลดสำเร็จ, false หากล้มเหลว
 */
export const loadFaceApiModels = async (): Promise<boolean> => {
  // หากโหลดแล้ว ไม่ต้องโหลดซ้ำ
  if (modelsLoaded) return true;

  try {
    // URL ของ models จาก GitHub repository ของ face-api.js
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    // โหลด 3 models พร้อมกัน (parallel loading)
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),    // ตรวจจับใบหน้า
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),   // หาจุดสำคัญ 68 จุด
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),  // สกัด face descriptor
    ]);

    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load face-api models:', error);
    return false;
  }
};

/**
 * ฟังก์ชันตรวจจับใบหน้าแบบง่าย - เช็คว่ามีหน้าคนในภาพหรือไม่
 * 
 * @param video - วิดีโอหรือภาพที่ต้องการตรวจสอบ
 * @returns Promise<boolean> - true หากเจอใบหน้า, false หากไม่เจอ
 */
export const detectFace = async (
  video: HTMLVideoElement | HTMLImageElement
): Promise<boolean> => {
  // ตรวจสอบว่าโหลด models แล้วหรือยัง
  if (!modelsLoaded) {
    const loaded = await loadFaceApiModels();
    if (!loaded) return false;
  }

  try {
    // ใช้ TinyFaceDetector หาใบหน้า 1 หน้า
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
    // หากเจอใบหน้า detection จะไม่เป็น undefined
    return detection !== undefined;
  } catch (error) {
    console.error('Face detection error:', error);
    return false;
  }
};

/**
 * ฟังก์ชันตรวจจับใบหน้าแบบครบถ้วน - ได้ข้อมูลครบ สำหรับ Face Recognition
 * 
 * ขั้นตอนการทำงาน:
 * 1. หาใบหน้าในภาพ (Face Detection)
 * 2. หาจุดสำคัญ 68 จุด (Face Landmarks) เช่น มุมตา, จมูก, ปาก
 * 3. สกัด Face Descriptor (128 มิติ) เป็นตัวเลขที่แทนลักษณะของใบหน้า
 * 
 * @param video - วิดีโอหรือภาพที่ต้องการวิเคราะห์
 * @returns ข้อมูลใบหน้าครบถ้วน หรือ undefined หากไม่เจอหน้า
 */
export const detectFaceWithLandmarksAndDescriptor = async (
  video: HTMLVideoElement | HTMLImageElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }>> | undefined> => {
  // ตรวจสอบว่าโหลด models แล้วหรือยัง
  if (!modelsLoaded) {
    const loaded = await loadFaceApiModels();
    if (!loaded) return undefined;
  }

  try {
    // ทำ 3 ขั้นตอนพร้อมกัน: detect face → find landmarks → extract descriptor
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())  // หาใบหน้า
      .withFaceLandmarks()    // หาจุดสำคัญ 68 จุด
      .withFaceDescriptor();  // สกัด descriptor 128 มิติ

    return detection;
  } catch (error) {
    console.error('Face detection with landmarks and descriptor error:', error);
    return undefined;
  }
};

/**
 * ฟังก์ชันวาดผลลัพธ์การตรวจจับใบหน้าบน Canvas
 * 
 * จะวาด:
 * 1. กรอบสี่เหลี่ยมรอบใบหน้า (Face Detection Box)
 * 2. จุดสำคัญ 68 จุดบนใบหน้า (Face Landmarks)
 * 
 * @param canvas - Canvas element ที่จะวาดผลลัพธ์
 * @param video - Video element ต้นฉบับ (สำหรับขนาด)
 * @param detection - ข้อมูลการตรวจจับใบหน้า
 */
export const drawDetectionResults = (
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }>>
): void => {
  // กำหนดขนาด canvas ให้ตรงกับวิดีโอ
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // ปรับขนาดข้อมูล detection ให้เหมาะกับ canvas
  const resizedDetections = faceapi.resizeResults(detection, displaySize);
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // ลบภาพเก่าออกก่อน
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // วาดกรอบใบหน้า (สี่เหลี่ยมรอบหน้า)
    faceapi.draw.drawDetections(canvas, [resizedDetections]);
    
    // วาดจุดสำคัญบนใบหน้า (68 จุด)
    faceapi.draw.drawFaceLandmarks(canvas, [resizedDetections]);
  }
};

// Export face-api.js library ให้ component อื่นใช้งาน (กรณีต้องการฟีเจอร์เพิ่มเติม)
export { faceapi };

