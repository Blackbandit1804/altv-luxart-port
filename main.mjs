import * as alt from 'alt';
import * as game from 'natives';

var count_bcast_timer = 0;
var delay_bcast_timer = 200;

var count_sndclean_timer = 0;
var delay_sndclean_timer = 400;

var actv_ind_timer = false;
var count_ind_timer = 0;
var delay_ind_timer = 180;

var actv_lxsrnmute_temp = false;
var srntone_temp = 0;
var dsrn_mute = true;

var state_indic = {};
var state_lxsiren = {};
var state_pwrcall = {};
var state_airmanu = {};

const ind_state_o = 0;
const ind_state_l = 1;
const ind_state_r = 2;
const ind_state_h = 3;

var snd_lxsiren = {};
var snd_pwrcall = {};
var snd_airmanu = {};

const eModelsWithFireSrn = ["FIRETRUK"];

const eModelsWithPcall = ["AMBULANCE","FIRETRUK","LGUARD"];

function useFiretruckSiren(veh) {
	var model = game.getEntityModel(veh)
	for (var i=0; i<eModelsWithFireSrn.length; i++) {
		if (model == game.getHashKey(eModelsWithFireSrn[i])) {
			return true
        }
	}
	return false
}

function usePowercallAuxSrn(veh) {
	var model = game.getEntityModel(veh)
    for (var i=0; i<eModelsWithPcall.length; i++) {
		if (model == game.getHashKey(eModelsWithPcall[i])) {
			return true
        }
	}
	return false
}

function cleanupSounds() {
	if (count_sndclean_timer > delay_sndclean_timer) {
		count_sndclean_timer = 0
		for (var k in state_lxsiren) {
            const v = state_lxsiren[k];
			if (v > 0) {
				if (!game.doesEntityExist(k) || game.isEntityDead(k)) {
					if (snd_lxsiren[k] != null) {
						game.stopSound(snd_lxsiren[k])
						game.releaseSoundId(snd_lxsiren[k])
						snd_lxsiren[k] = null
						state_lxsiren[k] = null
					}
				}
			}
		}
		for (var k in state_pwrcall) {
            const v = state_pwrcall[k];
			if (v == true) {
				if (!game.doesEntityExist(k) || game.isEntityDead(k)) {
					if (snd_pwrcall[k] != null) {
						game.stopSound(snd_pwrcall[k])
						game.releaseSoundId(snd_pwrcall[k])
						snd_pwrcall[k] = null
						state_pwrcall[k] = null
					}
				}
			}
		}
		for (var k in state_airmanu) {
            const v = state_airmanu[k];
			if (v == true) {
				if (!game.doesEntityExist(k) || game.isEntityDead(k) || game.isVehicleSeatFree(k, -1)) {
					if (snd_airmanu[k] != null) {
						game.stopSound(snd_airmanu[k])
						game.releaseSoundId(snd_airmanu[k])
						snd_airmanu[k] = null
						state_airmanu[k] = null
					}
				}
			}
        }
    }
	else {
		count_sndclean_timer += 1;
	}
}

function togIndicStateForVeh(veh, newstate) {
	if (game.doesEntityExist(veh) && !game.isEntityDead(veh)) {
		if (newstate == ind_state_o) {
			game.setVehicleIndicatorLights(veh, 0, false) // R
            game.setVehicleIndicatorLights(veh, 1, false) // L
        }
		else if  (newstate == ind_state_l) {
			game.setVehicleIndicatorLights(veh, 0, false) // R
            game.setVehicleIndicatorLights(veh, 1, true) // L
        }
		else if  (newstate == ind_state_r) {
			game.setVehicleIndicatorLights(veh, 0, true) // R
            game.setVehicleIndicatorLights(veh, 1, false) // L
        }
		else if  (newstate == ind_state_h) {
			game.setVehicleIndicatorLights(veh, 0, true) // R
            game.setVehicleIndicatorLights(veh, 1, true) // L
        }
		state_indic[veh] = newstate;
    }
}

function togMuteDfltSrnForVeh(veh, toggle) {
	if  (game.doesEntityExist(veh) && !game.isEntityDead(veh)) {
		game.disableVehicleImpactExplosionActivation(veh, toggle)
	}
}

function setLxSirenStateForVeh(veh, newstate) {
	if (game.doesEntityExist(veh) && !game.isEntityDead(veh)) {
		if (newstate != state_lxsiren[veh]) {
				
			if (snd_lxsiren[veh] != null) {
				game.stopSound(snd_lxsiren[veh])
				game.releaseSoundId(snd_lxsiren[veh])
				snd_lxsiren[veh] = null
			}
						
			if (newstate == 1) {
				if (useFiretruckSiren(veh)) {
                    togMuteDfltSrnForVeh(veh, false)
                }
				else {
					snd_lxsiren[veh] = game.getSoundId()	
					game.playSoundFromEntity(snd_lxsiren[veh], "VEHICLES_HORNS_SIREN_1", veh, 0, 0, 0)
					togMuteDfltSrnForVeh(veh, true)
				}
            }
			else if (newstate == 2) {
				snd_lxsiren[veh] = game.getSoundId()
				game.playSoundFromEntity(snd_lxsiren[veh], "VEHICLES_HORNS_SIREN_2", veh, 0, 0, 0)
				togMuteDfltSrnForVeh(veh, true)
			}
			else if (newstate == 3) {
				snd_lxsiren[veh] = game.getSoundId()
				if (useFiretruckSiren(veh)) {
                    game.playSoundFromEntity(snd_lxsiren[veh], "VEHICLES_HORNS_AMBULANCE_WARNING", veh, 0, 0, 0)
                }
				else {
					game.playSoundFromEntity(snd_lxsiren[veh], "VEHICLES_HORNS_POLICE_WARNING", veh, 0, 0, 0)
				}
				togMuteDfltSrnForVeh(veh, true)
            }
			else {
				togMuteDfltSrnForVeh(veh, true)
			}				
				
			state_lxsiren[veh] = newstate
		}
	}
}

function togPowercallStateForVeh(veh, toggle) {
	if (game.doesEntityExist(veh) && !game.isEntityDead(veh)) {
		if (toggle == true) {
			if (snd_pwrcall[veh] == null) {
				snd_pwrcall[veh] = game.getSoundId()
				if (usePowercallAuxSrn(veh)) {
                    game.playSoundFromEntity(snd_pwrcall[veh], "VEHICLES_HORNS_AMBULANCE_WARNING", veh, 0, 0, 0)
                }
				else {
					game.playSoundFromEntity(snd_pwrcall[veh], "VEHICLES_HORNS_SIREN_1", veh, 0, 0, 0)
				}
            }
        }
		else if (snd_pwrcall[veh] != null) {
            game.stopSound(snd_pwrcall[veh]);
            game.releaseSoundId(snd_pwrcall[veh]);
            snd_pwrcall[veh] = null;
        }
		state_pwrcall[veh] = toggle;
	}
}

function setAirManuStateForVeh(veh, newstate) {
	if (game.doesEntityExist(veh) && !game.isEntityDead(veh)) {
		if (newstate != state_airmanu[veh]) {	
			if (snd_airmanu[veh] != null) {
				game.stopSound(snd_airmanu[veh])
				game.releaseSoundId(snd_airmanu[veh])
				snd_airmanu[veh] = null
			}	
			if (newstate == 1) {
				snd_airmanu[veh] = game.getSoundId()
				if (useFiretruckSiren(veh)) {
                    game.playSoundFromEntity(snd_airmanu[veh], "VEHICLES_HORNS_FIRETRUCK_WARNING", veh, 0, 0, 0)
                }
				else {
					game.playSoundFromEntity(snd_airmanu[veh], "SIRENS_AIRHORN", veh, 0, 0, 0)
				}
            }
			else if (newstate == 2) {
				snd_airmanu[veh] = game.getSoundId()
				game.playSoundFromEntity(snd_airmanu[veh], "VEHICLES_HORNS_SIREN_1", veh, 0, 0, 0)
            }
			else if (newstate == 3) {
				snd_airmanu[veh] = game.getSoundId()
				game.playSoundFromEntity(snd_airmanu[veh], "VEHICLES_HORNS_SIREN_2", veh, 0, 0, 0)
			}				
			state_airmanu[veh] = newstate
		}
	}
}

alt.onServer("lvc_TogIndicState_c", function(sender, newstate) {
	var player_s = sender;
	var ped_s = game.getPlayerPed(player_s);
	if (game.doesEntityExist(ped_s) && !game.isEntityDead(ped_s)) {
		if (ped_s != game.getPlayerPed(alt.Player.local)) {
			if (game.isPedInAnyVehicle(ped_s, false)) {
				var veh = game.getVehiclePedIsUsing(ped_s);
				togIndicStateForVeh(veh, newstate);
			}
		}
	}
});


alt.onServer("lvc_TogDfltSrnMuted_c", function(sender, toggle) {
	var player_s = sender
	var ped_s = game.getPlayerPed(player_s)
	if (game.doesEntityExist(ped_s) && !game.isEntityDead(ped_s)) {
		if (ped_s != game.getPlayerPed(alt.Player.local)) {
			if (game.isPedInAnyVehicle(ped_s, false)) {
				var veh = game.getVehiclePedIsUsing(ped_s)
				togMuteDfltSrnForVeh(veh, toggle)
			}
		}
	}
});


alt.onServer("lvc_SetLxSirenState_c", function(sender, newstate) {
	var player_s = sender
	var ped_s = game.getPlayerPed(player_s)
	if (game.doesEntityExist(ped_s) && !game.isEntityDead(ped_s)) {
		if (ped_s != game.getPlayerPed(alt.Player.local)) {
			if (game.isPedInAnyVehicle(ped_s, false)) {
				var veh = game.getVehiclePedIsUsing(ped_s)
				setLxSirenStateForVeh(veh, newstate)
			}
		}
	}
});

alt.onServer("lvc_TogPwrcallState_c", function(sender, toggle) {
	var player_s = sender
	var ped_s = game.getPlayerPed(player_s)
	if (game.doesEntityExist(ped_s) && !game.isEntityDead(ped_s)) {
		if (ped_s != game.getPlayerPed(alt.Player.local)) {
			if (game.isPedInAnyVehicle(ped_s, false)) {
				var veh = game.getVehiclePedIsUsing(ped_s)
				togPowercallStateForVeh(veh, toggle)
			}
		}
	}
});

alt.onServer("lvc_SetAirManuState_c", function(sender, newstate) {
	var player_s = sender
	var ped_s = game.getPlayerPed(player_s)
	if (game.doesEntityExist(ped_s) && !game.isEntityDead(ped_s)) {
		if (ped_s != game.getPlayerPed(alt.Player.local)) {
			if (game.isPedInAnyVehicle(ped_s, false)) {
				var veh = game.getVehiclePedIsUsing(ped_s)
				setAirManuStateForVeh(veh, newstate)
			}
		}
	}
});

alt.everyTick(()=>{
    cleanupSounds()
    
    ////- IS IN VEHICLE ////-
    var playerped = game.getPlayerPed(alt.Player.local)		
    if (game.isPedInAnyVehicle(playerped, false)) {	
    
        //(CHECKED)
        ////- IS DRIVER ////-
        var veh = game.getVehiclePedIsUsing(playerped)	
        if (game.getPedInVehicleSeat(veh, -1) == playerped) {
        
            game.disableControlAction(0, 84, true) // INPUT_VEH_PREV_RADIO_TRACK  
            game.disableControlAction(0, 83, true) // INPUT_VEH_NEXT_RADIO_TRACK 
            
            if (state_indic[veh] != ind_state_o && state_indic[veh] != ind_state_l && state_indic[veh] != ind_state_r && state_indic[veh] != ind_state_h) {
                state_indic[veh] = ind_state_o
            }
            
            // INDIC AUTO CONTROL
            if (actv_ind_timer == true) {	
                if (state_indic[veh] == ind_state_l || state_indic[veh] == ind_state_r) {
                    if (game.getEntitySpeed(veh) < 6) {
                        count_ind_timer = 0
                    }
                    else {
                        if (count_ind_timer > delay_ind_timer) {
                            count_ind_timer = 0
                            actv_ind_timer = false
                            state_indic[veh] = ind_state_o
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            togIndicStateForVeh(veh, state_indic[veh])
                            count_bcast_timer = delay_bcast_timer
                        }
                        else {
                            count_ind_timer = count_ind_timer + 1
                        }
                    }
                }
            }
            
            
            //(CHECKED)
            //- IS EMERG VEHICLE //-
            if (game.getVehicleClass(veh) == 18) {
                
                var actv_manu = false
                var actv_horn = false
                
                game.disableControlAction(0, 86, true) // INPUT_VEH_HORN	
                game.disableControlAction(0, 172, true) // INPUT_CELLPHONE_UP 
                //game.disableControlAction(0, 173, true) // INPUT_CELLPHONE_DOWN
                //game.disableControlAction(0, 174, true) // INPUT_CELLPHONE_LEFT 
                //game.disableControlAction(0, 175, true) // INPUT_CELLPHONE_RIGHT 
                game.disableControlAction(0, 81, true) // INPUT_VEH_NEXT_RADIO
                game.disableControlAction(0, 82, true) // INPUT_VEH_PREV_RADIO
                game.disableControlAction(0, 19, true) // INPUT_CHARACTER_WHEEL 
                game.disableControlAction(0, 85, true) // INPUT_VEH_RADIO_WHEEL 
                game.disableControlAction(0, 80, true) // INPUT_VEH_CIN_CAM 
            
                game.setVehRadioStation(veh, "OFF")
                game.setVehicleRadioEnabled(veh, false)
                
                if (state_lxsiren[veh] != 1 && state_lxsiren[veh] != 2 && state_lxsiren[veh] != 3) {
                    state_lxsiren[veh] = 0
                }
                if (state_pwrcall[veh] != true) {
                    state_pwrcall[veh] = false
                }
                if (state_airmanu[veh] != 1 && state_airmanu[veh] != 2 && state_airmanu[veh] != 3) {
                    state_airmanu[veh] = 0
                }
                
                if (useFiretruckSiren(veh) && state_lxsiren[veh] == 1) {
                    togMuteDfltSrnForVeh(veh, false)
                    dsrn_mute = false
                }
                else {
                    togMuteDfltSrnForVeh(veh, true)
                    dsrn_mute = true
                }
                
                if (!game.isVehicleSirenOn(veh) && state_lxsiren[veh] > 0) {
                    game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                    setLxSirenStateForVeh(veh, 0)
                    count_bcast_timer = delay_bcast_timer
                }
                if (!game.isVehicleSirenOn(veh) && state_pwrcall[veh] == true) {
                    game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                    togPowercallStateForVeh(veh, false)
                    count_bcast_timer = delay_bcast_timer
                }
                ////- CONTROLS ////-
                if (!game.isPauseMenuActive()) {
                
                    // TOG DFLT SRN LIGHTS
                    if (game.isDisabledControlJustReleased(0, 85) || game.isDisabledControlJustReleased(0, 246)) {
                        if (game.isVehicleSirenOn(veh)) {
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            game.setVehicleSiren(veh, false)
                        }
                        else {
                            game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            game.setVehicleSiren(veh, true)
                            count_bcast_timer = delay_bcast_timer
                        }		
                    }
                    // TOG LX SIREN
                    else if (game.isDisabledControlJustReleased(0, 19) || game.isDisabledControlJustReleased(0, 82)) {
                        var cstate = state_lxsiren[veh]
                        if (cstate == 0) {
                            if (game.isVehicleSirenOn(veh)) {
                                game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1) // on
                                setLxSirenStateForVeh(veh, 1)
                                count_bcast_timer = delay_bcast_timer
                            }
                        else
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1) // off
                            setLxSirenStateForVeh(veh, 0)
                            count_bcast_timer = delay_bcast_timer
                        }
                    }
                    // POWERCALL
                    else if (game.isDisabledControlJustReleased(0, 172)) {
                        if (state_pwrcall[veh] == true) {
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            togPowercallStateForVeh(veh, false)
                            count_bcast_timer = delay_bcast_timer
                        }
                        else {
                            if (game.isVehicleSirenOn(veh)) {
                                game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                                togPowercallStateForVeh(veh, true)
                                count_bcast_timer = delay_bcast_timer
                            }
                        }
                    }
                    
                    // BROWSE LX SRN TONES
                    if (state_lxsiren[veh] > 0) {
                        if (game.isDisabledControlJustReleased(0, 80) || game.isDisabledControlJustReleased(0, 81)) {
                            if (game.isVehicleSirenOn(veh)) {
                                var cstate = state_lxsiren[veh]
                                var nstate = 1
                                game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1) // on
                                if (cstate == 1) {
                                    nstate = 2
                                }
                                else if (cstate == 2) {
                                    nstate = 3
                                }
                                else {
                                    nstate = 1
                                }
                                setLxSirenStateForVeh(veh, nstate)
                                count_bcast_timer = delay_bcast_timer
                            }
                        }
                    }
                                
                    // MANU
                    if (state_lxsiren[veh] < 1) {
                        if (game.isDisabledControlPressed(0, 80) || game.isDisabledControlPressed(0, 81)) {
                            actv_manu = true
                        }
                        else {
                            actv_manu = false
                        }
                    }
                    else {
                        actv_manu = false
                    }
                    
                    // HORN
                    if (game.isDisabledControlPressed(0, 86)) {
                        actv_horn = true
                    }
                    else {
                        actv_horn = false
                    }
                
                }
                
                //// ADJUST HORN / MANU STATE ////
                var hmanu_state_new = 0
                if (actv_horn == true && actv_manu == false) {
                    hmanu_state_new = 1
                }
                else if (actv_horn == false && actv_manu == true) {
                    hmanu_state_new = 2
                }
                else if (actv_horn == true && actv_manu == true) {
                    hmanu_state_new = 3
                }
                if (hmanu_state_new == 1) {
                    if (!useFiretruckSiren(veh)) {
                        if (state_lxsiren[veh] > 0 && actv_lxsrnmute_temp == false) {
                            srntone_temp = state_lxsiren[veh]
                            setLxSirenStateForVeh(veh, 0)
                            actv_lxsrnmute_temp = true
                        }
                    }
                }
                else {
                    if (!useFiretruckSiren(veh)) {
                        if (actv_lxsrnmute_temp == true) {
                            setLxSirenStateForVeh(veh, srntone_temp)
                            actv_lxsrnmute_temp = false
                        }
                    }
                }
                if (state_airmanu[veh] != hmanu_state_new) {
                    setAirManuStateForVeh(veh, hmanu_state_new)
                    count_bcast_timer = delay_bcast_timer
                }	
            }
            
                
            //- IS ANY LAND VEHICLE //-	
            //(CHECKED)
            if (game.getVehicleClass(veh) != 14 && game.getVehicleClass(veh) != 15 && game.getVehicleClass(veh) != 16 && game.getVehicleClass(veh) != 21) {
            
                ////- CONTROLS ////-
                if (!game.isPauseMenuActive()) {
                    // IND L
                    if (game.isDisabledControlJustReleased(0, 84)) { // INPUT_VEH_PREV_RADIO_TRACK
                        var cstate = state_indic[veh]
                        if (cstate == ind_state_l) {
                            state_indic[veh] = ind_state_o
                            actv_ind_timer = false
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                        }
                        else {
                            state_indic[veh] = ind_state_l
                            actv_ind_timer = true
                            game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                        }
                        togIndicStateForVeh(veh, state_indic[veh])
                        count_ind_timer = 0
                        count_bcast_timer = delay_bcast_timer			
                    // IND R
                    }
                    else if (game.isDisabledControlJustReleased(0, 83)) { // INPUT_VEH_NEXT_RADIO_TRACK
                        var cstate = state_indic[veh]
                        if (cstate == ind_state_r) {
                            state_indic[veh] = ind_state_o
                            actv_ind_timer = false
                            game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                        }
                        else {
                            state_indic[veh] = ind_state_r
                            actv_ind_timer = true
                            game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                        }
                        togIndicStateForVeh(veh, state_indic[veh])
                        count_ind_timer = 0
                        count_bcast_timer = delay_bcast_timer
                    }
                    // IND H //(CHECKED)
                    else if (game.isControlJustReleased(0, 202)) { // INPUT_FRONTEND_CANCEL / Backspace
                        if (game.getLastInputMethod(0)) { // last input was with kb
                            var cstate = state_indic[veh]
                            if (cstate == ind_state_h) {
                                state_indic[veh] = ind_state_o
                                game.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            }
                            else {
                                state_indic[veh] = ind_state_h
                                game.playSoundFrontend(-1, "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 1)
                            }
                            togIndicStateForVeh(veh, state_indic[veh])
                            actv_ind_timer = false
                            count_ind_timer = 0
                            count_bcast_timer = delay_bcast_timer
                        }
                    }
                
                }
                
                
                ////- AUTO BROADCAST VEH STATES ////-
                if (count_bcast_timer > delay_bcast_timer) {
                    count_bcast_timer = 0
                    //- IS EMERG VEHICLE //-
                    if (game.getVehicleClass(veh) == 18) {
                        alt.emitServer("lvc_TogDfltSrnMuted_s", dsrn_mute);
                        alt.emitServer("lvc_SetLxSirenState_s", state_lxsiren[veh]);
                        alt.emitServer("lvc_TogPwrcallState_s", state_pwrcall[veh]);
                        alt.emitServer("lvc_SetAirManuState_s", state_airmanu[veh]);
                    }
                    //- IS ANY OTHER VEHICLE //-
                    alt.emitServer("lvc_TogIndicState_s", state_indic[veh]);
                }
                else {
                    count_bcast_timer = count_bcast_timer + 1;
                }
            
            }
            
        }
    }
});