import { db, initDatabase } from './database.js';

export function seed() {
  console.log('🌱 Seeding LabLink database with realistic campus data...');
  initDatabase();

  // Clear existing tables in correct order
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM allocation_recommendations;
    DELETE FROM bookings;
    DELETE FROM booking_requests;
    DELETE FROM projects;
    DELETE FROM maintenance_schedules;
    DELETE FROM availability_schedules;
    DELETE FROM equipment;
    DELETE FROM equipment_categories;
    DELETE FROM laboratories;
    DELETE FROM users;
    DELETE FROM departments;
    DELETE FROM audit_logs;
    DELETE FROM scheduling_weight_configs;
  `);

  // 1. Departments
  const insertDept = db.prepare(`
    INSERT INTO departments (id, code, name, description, icon)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertDept.run('dept-cse', 'CSE', 'Computer Science and Engineering', 'Software systems, machine learning, and high-performance computing labs.', 'Cpu');
  insertDept.run('dept-ece', 'ECE', 'Electronics and Communication Engineering', 'Microcontrollers, signal analysis, RF testing, and embedded architecture labs.', 'Radio');
  insertDept.run('dept-eee', 'EEE', 'Electrical and Electronics Engineering', 'Power electronics, instrumentation, and control systems facilities.', 'Zap');
  insertDept.run('dept-mech', 'MECH', 'Mechanical Engineering', 'Rapid prototyping, additive manufacturing, and physical design facilities.', 'Settings');
  insertDept.run('dept-robotics', 'ROBO', 'Robotics and Automation', 'Kinematics, autonomous robotics, ROS development, and mechatronics lab.', 'Bot');

  // 2. Laboratories
  const insertLab = db.prepare(`
    INSERT INTO laboratories (id, name, room_number, department_id, operating_hours)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertLab.run('lab-ai', 'AI and Machine Learning Lab', 'Lab Block 302', 'dept-cse', '08:00 - 18:00');
  insertLab.run('lab-adv-comp', 'Advanced Computing Lab', 'Lab Block 305', 'dept-cse', '08:00 - 19:00');
  insertLab.run('lab-embedded', 'Embedded Systems Lab', 'Science Wing 201', 'dept-ece', '08:00 - 18:00');
  insertLab.run('lab-pcb', 'PCB Design Lab', 'Science Wing 204', 'dept-ece', '08:30 - 17:30');
  insertLab.run('lab-elec-test', 'Electronics Testing Lab', 'Science Wing 208', 'dept-eee', '08:00 - 18:00');
  insertLab.run('lab-iot', 'IoT Innovation Lab', 'Innovation Center 101', 'dept-cse', '08:00 - 20:00');
  insertLab.run('lab-robotics', 'Robotics Lab', 'Mechatronics Annex 10', 'dept-robotics', '08:00 - 18:00');

  // 3. Equipment Categories
  const insertCat = db.prepare(`
    INSERT INTO equipment_categories (id, name, slug, description, icon)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertCat.run('cat-fpga', 'FPGA Development', 'fpga-development', 'Field Programmable Gate Array boards and synthesis toolchains.', 'Layers');
  insertCat.run('cat-embedded', 'Embedded Systems', 'embedded-systems', 'Development kits, ARM controllers, and firmware debugging platforms.', 'Cpu');
  insertCat.run('cat-iot', 'Internet of Things', 'iot', 'Wireless sensor nodes, telemetry gateways, and mesh testing gear.', 'Wifi');
  insertCat.run('cat-ai', 'Artificial Intelligence', 'ai-workstations', 'Edge compute modules, Tensor processing accelerators, and GPU rigs.', 'Brain');
  insertCat.run('cat-elec', 'Electronics', 'electronics', 'Signal measurement, precision multimeters, and waveform analyzers.', 'Activity');
  insertCat.run('cat-3d', '3D Printing', '3d-printing', 'Fused deposition and resin rapid additive manufacturing stations.', 'Printer');
  insertCat.run('cat-pcb', 'PCB Prototyping', 'pcb-prototyping', 'Milling, stencil printing, and SMD pick-and-place workstations.', 'CircuitBoard');
  insertCat.run('cat-hpc', 'Computing Workstations', 'hpc-workstations', 'Multi-GPU parallel processing clusters for simulations and neural training.', 'Server');
  insertCat.run('cat-robo', 'Robotics', 'robotics', 'Articulated manipulators, mobile rover bases, and ROS controller rigs.', 'Bot');

  // 4. Users (Demo fictional profiles)
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, avatar, department_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('student-1', 'Aarav Sharma', 'aarav.sharma@campus.edu', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', 'dept-cse');
  insertUser.run('student-2', 'Priya Patel', 'priya.patel@campus.edu', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'dept-ece');
  insertUser.run('student-3', 'Rohan Verma', 'rohan.verma@campus.edu', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', 'dept-robotics');
  insertUser.run('student-4', 'Sneha Reddy', 'sneha.reddy@campus.edu', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', 'dept-eee');

  insertUser.run('faculty-1', 'Dr. Vikram Sen', 'vikram.sen@campus.edu', 'FACULTY', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrSen', 'dept-cse');
  insertUser.run('faculty-2', 'Prof. Ananya Iyer', 'ananya.iyer@campus.edu', 'FACULTY', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', 'dept-ece');

  insertUser.run('admin-1', 'Campus Facilities Admin', 'admin@campus.edu', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', null);

  // 5. Equipment (Realistic 12 items across departments)
  const insertEq = db.prepare(`
    INSERT INTO equipment (
      id, equipment_code, name, category_id, department_id, laboratory_id,
      description, specifications, status, max_duration_hours, requires_approval,
      model_number, icon_svg
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEq.run(
    'eq-fpga-01',
    'EQ-FPGA-01',
    'FPGA Development Kit',
    'cat-fpga',
    'dept-ece',
    'lab-embedded',
    'Advanced Xilinx Artix-7 FPGA development platform equipped with dual PMOD headers, DDR3 memory, and USB-JTAG programming interface for digital system design and hardware acceleration.',
    'Xilinx Artix-7 XC7A100T-1CSG324C, 101,440 logic cells, 256MB DDR3, Vivado Design Suite compatible, HDMI out, dual PMOD ports, 100MHz clock oscillator.',
    'AVAILABLE',
    4,
    1,
    'Nexys A7-100T',
    'Layers'
  );

  insertEq.run(
    'eq-jetson-01',
    'EQ-JETSON-01',
    'NVIDIA Jetson Nano Developer Kit',
    'cat-ai',
    'dept-cse',
    'lab-ai',
    'Compact edge AI computing board capable of running multiple neural networks in parallel for applications like image classification, object detection, and speech processing.',
    '128-core NVIDIA Maxwell GPU, Quad-core ARM Cortex-A57 CPU, 4GB 64-bit LPDDR4, 472 GFLOPS FP16 compute, MIPI CSI-2 camera connector, Gigabit Ethernet.',
    'AVAILABLE',
    4,
    1,
    'Jetson Nano B01',
    'Cpu'
  );

  insertEq.run(
    'eq-rpi5-01',
    'EQ-RPI5-01',
    'Raspberry Pi 5 Development Kit',
    'cat-embedded',
    'dept-cse',
    'lab-iot',
    'Latest generation single-board computer featuring 2-3x CPU speed uplift, dual 4Kp60 HDMI display outputs, and high-speed PCIe peripheral connectivity.',
    'Broadcom BCM2712 2.4GHz quad-core 64-bit Arm Cortex-A76, 8GB LPDDR4X SDRAM, VideoCore VII GPU, dual 4Kp60 micro-HDMI, PCIe 2.0 interface, Gigabit Ethernet with PoE+ support.',
    'AVAILABLE',
    4,
    1,
    'RPi 5 8GB',
    'Layers'
  );

  insertEq.run(
    'eq-esp32-01',
    'EQ-ESP32-01',
    'ESP32 Development Board Kit',
    'cat-iot',
    'dept-ece',
    'lab-iot',
    'Feature-rich Wi-Fi and Bluetooth BLE microcontroller module designed for ultra-low-power telemetry, mesh networking, and connected sensor nodes.',
    'Dual-core Xtensa 32-bit LX6 MCU up to 240MHz, 520KB SRAM, integrated 802.11 b/g/n Wi-Fi & BT 4.2 BLE, capacitive touch sensors, Hall sensor, UART/SPI/I2C/PWM.',
    'AVAILABLE',
    3,
    0,
    'ESP32-WROOM-32D',
    'Wifi'
  );

  insertEq.run(
    'eq-arduino-01',
    'EQ-ARD-01',
    'Arduino Uno Development Kit',
    'cat-embedded',
    'dept-ece',
    'lab-embedded',
    'Industry-standard ATmega328P microcontroller starter laboratory kit with integrated breadboards, actuators, telemetry modules, and USB interface.',
    'Microchip ATmega328P 8-bit AVR RISC @ 16MHz, 32KB Flash, 2KB SRAM, 14 digital I/O pins (6 PWM), 6 analog inputs, 5V operating logic level.',
    'AVAILABLE',
    3,
    0,
    'Arduino Uno R3 Kit',
    'Cpu'
  );

  insertEq.run(
    'eq-scope-01',
    'EQ-SCOPE-01',
    'Digital Storage Oscilloscope',
    'cat-elec',
    'dept-eee',
    'lab-elec-test',
    'High-bandwidth 4-channel digital oscilloscope with deep memory capture, automated protocol decoding (I2C/SPI/UART), and FFT spectral analysis.',
    '200 MHz analog bandwidth, 4 analog channels, 2 GSa/s real-time sample rate, 24 Mpts memory depth, 7-inch WVGA color display, 50,000 wfms/s waveform capture rate.',
    'AVAILABLE',
    4,
    1,
    'Keysight DSOX1204G',
    'Activity'
  );

  insertEq.run(
    'eq-3dprint-01',
    'EQ-3DPR-01',
    '3D Prototyping Printer',
    'cat-3d',
    'dept-mech',
    'lab-robotics',
    'Precision additive manufacturing station featuring automatic 32-point bed leveling, dual-gear direct drive extruder, and multi-filament capability.',
    '250 x 210 x 220 mm build volume, 0.05-0.30mm layer resolution, Nextruder with load cell sensor, PEI magnetic spring sheet, max nozzle temp 300°C (PLA/PETG/ABS/Nylon).',
    'AVAILABLE',
    6,
    1,
    'Prusa i3 MK4',
    'Printer'
  );

  insertEq.run(
    'eq-pcb-01',
    'EQ-PCB-01',
    'PCB Prototyping Station',
    'cat-pcb',
    'dept-ece',
    'lab-pcb',
    'Direct-write precision conductive ink circuit printer and reflow station capable of rapid double-sided PCB layout prototyping and SMD assembly.',
    'Conductive trace printing, solder paste dispensing, 65-micron minimum trace spacing, integrated heated bed up to 240°C reflow, Gerbers/EAGLE/Altium CAM compatible.',
    'AVAILABLE',
    4,
    1,
    'Voltera V-One Pro',
    'CircuitBoard'
  );

  insertEq.run(
    'eq-hpc-01',
    'EQ-HPC-01',
    'High-Performance Computing Workstation',
    'cat-hpc',
    'dept-cse',
    'lab-adv-comp',
    'Heavy computation node optimized for deep neural network training, LLM fine-tuning, finite-element physics analysis, and parallel simulation models.',
    'AMD Threadripper PRO 5975WX (32 cores / 64 threads), Dual NVIDIA RTX 4090 24GB GPUs (48GB VRAM total), 128GB DDR5 ECC RAM, 4TB NVMe PCIe 4.0 SSD, Ubuntu 22.04 LTS + CUDA 12.4.',
    'AVAILABLE',
    6,
    1,
    'TensorStation Pro Dual',
    'Server'
  );

  insertEq.run(
    'eq-iot-01',
    'EQ-IOT-01',
    'IoT Sensor Testing Kit',
    'cat-iot',
    'dept-cse',
    'lab-iot',
    'Comprehensive environmental and industrial sensor array bundle including environmental gas probes, LiDAR distance modules, LoRaWAN transceiver kits, and spectrum sniffer.',
    'Sensirion SCD40 CO2, BME688 air quality, TF-Luna LiDAR, RFM95W 868MHz LoRa nodes, logic sniffer, calibration chamber with environmental chamber chamber access.',
    'AVAILABLE',
    3,
    0,
    'SenseLab Matrix V3',
    'Wifi'
  );

  insertEq.run(
    'eq-robo-01',
    'EQ-ROBO-01',
    'Robotic Arm Development Kit',
    'cat-robo',
    'dept-robotics',
    'lab-robotics',
    '6-axis articulated manipulator arm with brushless servo actuators, force-torque sensing, depth vision integration, and ROS 2 Humble control framework.',
    '6 Degrees of Freedom, 1.5kg payload capacity, 500mm reach radius, 0.2mm repeatability, embedded Intel RealSense D435i depth camera, ROS2 MoveIt kinematics package.',
    'AVAILABLE',
    4,
    1,
    'xArm 6 Pro Edu',
    'Bot'
  );

  insertEq.run(
    'eq-logic-01',
    'EQ-LOGIC-01',
    'Logic Analyzer High-Speed Kit',
    'cat-elec',
    'dept-ece',
    'lab-elec-test',
    '16-channel mixed-signal logic analyzer for high-speed digital protocol debugging, timing analysis, bus contention diagnosis, and glitch capture.',
    '16 digital channels, 500 MS/s max sampling rate, 100MHz digital bandwidth, USB 3.0 interface, automated decode for SPI, I2C, CAN, LIN, USB, PCIe, and custom bit streams.',
    'AVAILABLE',
    3,
    0,
    'Saleae Logic Pro 16',
    'Activity'
  );

  // 6. Projects
  const insertProj = db.prepare(`
    INSERT INTO projects (id, title, description, category, department_id, student_id, deadline, tech_stack)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProj.run(
    'proj-drone-nav',
    'Autonomous Drone Navigation System',
    'Developing real-time optical flow visual odometry and obstacle avoidance for edge drones using onboard hardware acceleration.',
    'Autonomous Robotics',
    'dept-cse',
    'student-1',
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now (urgent!)
    'ROS2, Python, OpenCV, Vivado FPGA / Jetson Nano'
  );

  insertProj.run(
    'proj-health-patch',
    'Smart Health Monitoring Patch',
    'Wearable non-invasive ECG and SpO2 telemetry patch broadcasting encrypted telemetry via Bluetooth Low Energy and LoRaWAN.',
    'IoT & Embedded',
    'dept-eee',
    'student-4',
    new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    'ESP32, C++, Altium, Analog Front-End, Oscilloscope'
  );

  insertProj.run(
    'proj-edge-traffic',
    'Edge AI Traffic Flow Optimizer',
    'Multimodal computer vision pipeline analyzing intersection density to dynamically calibrate signal timings at microsecond latency.',
    'Artificial Intelligence',
    'dept-robotics',
    'student-3',
    new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    'PyTorch, CUDA, TensorRT, Jetson Nano, Ubuntu'
  );

  // 7. Seed weight configuration
  db.prepare(`
    INSERT OR REPLACE INTO scheduling_weight_configs (id, deadline_weight, compatibility_weight, waiting_time_weight, fairness_weight, feasibility_weight)
    VALUES ('default-config', 0.35, 0.25, 0.15, 0.15, 0.10)
  `).run();

  // 8. Seed sample active booking to show realistic calendar occupancy
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const insertReq = db.prepare(`
    INSERT INTO booking_requests (
      id, project_id, equipment_id, student_id, requested_date,
      start_time, end_time, duration_minutes, project_deadline,
      technical_requirements, access_reason, status, priority_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReq.run(
    'req-sample-approved',
    'proj-health-patch',
    'eq-scope-01',
    'student-4',
    tomorrowStr,
    '14:00',
    '17:00',
    180,
    new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    'Requires low-noise analog probe calibration for ECG signal noise reduction.',
    'Calibrating biopotential front-end operational amplifier noise floor.',
    'APPROVED',
    78.5
  );

  db.prepare(`
    INSERT INTO bookings (id, booking_request_id, equipment_id, student_id, scheduled_date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'book-sample-01',
    'req-sample-approved',
    'eq-scope-01',
    'student-4',
    tomorrowStr,
    '14:00',
    '17:00',
    'ACTIVE'
  );

  // 9. Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotif.run('notif-1', 'student-4', 'Booking Approved', 'Your request for Digital Storage Oscilloscope on ' + tomorrowStr + ' (14:00-17:00) has been approved by Prof. Ananya Iyer.', 'APPROVAL', '/bookings', 0);
  insertNotif.run('notif-2', 'student-1', 'Welcome to LabLink', 'Discover and request specialized lab resources across 5 engineering departments.', 'SUBMISSION', '/equipment', 1);

  // 10. Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, action, entity_type, entity_id, actor_name, actor_role, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'audit-seed-1',
    'SYSTEM_INITIALIZED',
    'SYSTEM',
    'system',
    'System Bootstrap',
    'ADMIN',
    'Seeded initial campus departments, labs, equipment catalog, and demonstration accounts.'
  );

  console.log('✅ LabLink database seeded successfully with 5 departments, 7 labs, 12 equipment items, and demo scenario profiles!');
}

seed();
