import * as alt from 'alt';

/*
--[[
---------------------------------------------------
LUXART VEHICLE CONTROL (FOR ALTV)
---------------------------------------------------
Last revision: NOV 07 2016
Coded by Lt.Caine
Ported by Lance Good
---------------------------------------------------
NOTES
	
---------------------------------------------------
]]
*/

alt.onClient("lvc_TogDfltSrnMuted_s", function(player, toggle) {
	alt.emitClient(null, "lvc_TogDfltSrnMuted_c", player, toggle);
});

alt.onClient("lvc_SetLxSirenState_s", function(player, newstate) {
	alt.emitClient(null, "lvc_SetLxSirenState_c", player, newstate);
});

alt.onClient("lvc_TogPwrcallState_s", function(player, toggle) {
	alt.emitClient(null, "lvc_TogPwrcallState_c", player, toggle);
});

alt.onClient("lvc_SetAirManuState_s", function(player, newstate) {
	alt.emitClient(null, "lvc_SetAirManuState_c", player, newstate);
});

alt.onClient("lvc_TogIndicState_s", function(player, newstate) {
	alt.emitClient(null, "lvc_TogIndicState_c", player, newstate);
});
