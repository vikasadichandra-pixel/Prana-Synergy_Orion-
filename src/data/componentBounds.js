// SVG geometry bounds measured after fonts load: [x, y, width, height].
// These include pin overhangs, terminals and labels outside the nominal drawing.
const measured = {
  spacer_right:[0,0,48,48],spacer_left:[0,0,48,48],usb_connector:[0,0,165,180],usb_bracket:[0,0,135,95],
  button_boot:[0,0,68,68],button_en:[0,0,68,68],header_right:[0,0,80,265],header_left:[0,0,80,265],rf_module:[0,0,330,415],pcb:[0,0,605,740],
  sd_rear_shell:[0,0,135,195],sd_contact_pins:[0,0,130,190],sd_pcb_substrate:[0,0,130,190],sd_controller:[0,0,130,190],sd_nand_die:[0,0,130,190],sd_front_spacer:[0,0,135,195],sd_faceplate:[0,0,140,195],
  disp_pcb:[0,0,160,200],disp_fpc:[0,10,80,100],disp_backlight:[0,0,140,220],disp_tft:[0,0,140,220],disp_bezel:[0,0,160,240],
  reg_ads1115:[0,0,70,70],reg_tvs:[0,0,40,40],reg_fuse:[0,0,40,50],reg_xt30:[0,0,50,40],reg_pins:[135,50,55.58,110],reg_ic:[0,20,160,170],reg_heatsink:[0,0,110,180],
  thm_leads:[10,0,60,220],thm_core:[5,10,30,35],thm_glass:[0,7.5,60,92.5],
  bs_ad5933:[0,0,90,90],bs_pins:[-5,20,55,80],bs_body:[0,0,160,160],bs_face:[0,30,100,80],
  rf_pins:[-5,20,55,110],rf_pcb:[-15,0,175,160],rf_shield:[0,0,120,120],
  vib_mount:[0,0,160,180],vib_carrier:[0,0,180,200],vib_adxl:[0,0,120,160],vib_piezo:[4,4,132,132],
  env_shield:[-4,0,148,180],env_carrier:[0,0,180,220],env_bmp390:[0,0,100,130],env_sht41:[0,0,100,130],env_grill:[0,0,120,200],
  bat_socket:[0,30,98,70],bat_wire:[0,52.5,138,65.36],bat_kapton:[0,0,95,180],bat_foam:[0,0,110,200],bat_bms:[0,0,115,200],bat_cells:[4,0,132,220],bat_pvc:[0,0,140,220],
  mos_tc4420:[0,0,80,80],mos_tab:[10,0,120,240],mos_die:[-20,0,100,100],mos_face:[0,30,120,90],
  ts_max31865:[0,0,90,90],ts_leads:[0,0,60,238.07],ts_die:[-2,0,44,60],ts_face:[0,6.25,80,73.75],
  conv_wsl:[0,0,60,40],conv_ina228:[0,0,80,80],conv_terminals:[0,-4.19,40,174.19],conv_pcb:[0,0,220,220],conv_inductors:[-5,5,176.87,110],
  eh_coldpad:[0,0,160,160],eh_transformer:[10,10,80,105.54],eh_ltc3108:[0,0,120,160],eh_teg:[0,0,160,160],eh_hotpad:[0,0,140,140],
  hp_cond:[0,-10,30,190],hp_core:[0,0,240,40],hp_evap:[-10,0,90,120],rad_shroud:[0,0,80,240],rad_fins:[0,0,120,220],rad_base:[0,0,60,180],
  str_base:[0,0,280,40],str_core:[10,10,220,100],str_top:[0,0,260,60],
  proto_standoffs:[10,18,174,95.54],proto_pcb:[0,0,300,220],proto_grid:[0,0,280,200],proto_rails:[0,0,280,60],
  ins_bottom:[0,0,180,280],ins_core:[0,0,220,320],ins_top:[0,0,180,280],sol_base:[0,0,280,340],sol_fill:[17.5,17.5,125,125],sol_coat:[0,0,240,300],
  rad_inner:[0,0,180,260],rad_absorb:[0,0,200,280],rad_outer:[0,0,220,300],
  lora_pins:[-16.54,24.34,203.58,129.66],lora_pcb:[0,0,140,180],lora_shield:[0,0,100,120],
  ant_base:[10,65,378,95],ant_coil:[0,7,125,56],ant_coupler:[0,8,45,24],ant_rod:[0,9,270,12],ant_tip:[0,16.9,47,16.2],
};
export const PART_BOUNDS=Object.fromEntries(Object.entries(measured).map(([id,[x,y,width,height]])=>[id,{x,y,width,height}]));
