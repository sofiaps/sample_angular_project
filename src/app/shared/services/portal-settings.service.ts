import { Injectable } from "@angular/core";
import { ApiClientService } from './ApiClient.service';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: "root"
})
export class PortalSettingsService {
  public settings: any = {};
  public settingsAdmin: any;
  public settingsChange: Subject<string> = new Subject<string>();
  public settingsAdminChange: Subject<string> = new Subject<string>();
  public settingsSubscription:any;
  public settingsAdminSubscription:any;

  constructor(private ApiClientService: ApiClientService) {
    this.settingsSubscription = this.settingsChange.subscribe((value) => {
            this.settings['default'] = value;
        });

    this.settingsAdminSubscription = this.settingsAdminChange.subscribe((value) => {
          this.settings = value;
        });
  }

  async setSettings(settings , v) {
    if(v=="all"){
      settings['default']['ad_bonus'] = JSON.parse(settings['default']['ad_bonus']);
      settings['default']['at_a'] = JSON.parse(settings['default']['at_a']);
      settings['default']['at_b'] = JSON.parse(settings['default']['at_b']);
      settings['default']['budget'] = JSON.parse(settings['default']['budget']);
      settings['default']['cluster'] = JSON.parse(settings['default']['cluster']);
      settings['default']['com_b'] = JSON.parse(settings['default']['scorecard'])['com_b'];
      settings['default']['com_p'] = JSON.parse(settings['default']['scorecard'])['com_p'];
      settings['default']['id_bonus'] = JSON.parse(settings['default']['id_bonus']);
      settings['default']['korrektur_faktoren'] = JSON.parse(settings['default']['korrektur_faktoren']);
      settings['default']['obu_b'] = JSON.parse(settings['default']['scorecard'])['obu_b'];
      settings['default']['obu_p'] = JSON.parse(settings['default']['scorecard'])['obu_p'];
      settings['default']['obu_med'] = JSON.parse(settings['admin']['scorecard'])['obu_med'];
      settings['default']['scorecard'] = JSON.parse(settings['default']['scorecard']);
      settings['default']['salary_plans'] = JSON.parse(settings['default']['salary_plans']);
      settings['default']['ex_bms_mitarbeiter'] = JSON.parse(settings['default']['ex_bms_mitarbeiter']);


      settings['admin']['ad_bonus'] = JSON.parse(settings['admin']['ad_bonus']);
      settings['admin']['at_a'] = JSON.parse(settings['admin']['at_a']);
      settings['admin']['at_b'] = JSON.parse(settings['admin']['at_b']);
      settings['admin']['budget'] = JSON.parse(settings['admin']['budget']);
      settings['admin']['cluster'] = JSON.parse(settings['admin']['cluster']);
      settings['admin']['com_b'] = JSON.parse(settings['admin']['scorecard'])['com_b'];
      settings['admin']['com_p'] = JSON.parse(settings['admin']['scorecard'])['com_p'];
      settings['admin']['id_bonus'] = JSON.parse(settings['admin']['id_bonus']);
      settings['admin']['korrektur_faktoren'] = JSON.parse(settings['admin']['korrektur_faktoren']);
      settings['admin']['obu_b'] = JSON.parse(settings['admin']['scorecard'])['obu_b'];
      settings['admin']['obu_p'] = JSON.parse(settings['admin']['scorecard'])['obu_p'];
      settings['admin']['obu_med'] = JSON.parse(settings['admin']['scorecard'])['obu_med'];
      settings['admin']['scorecard'] = JSON.parse(settings['admin']['scorecard']);
      settings['admin']['salary_plans'] = JSON.parse(settings['admin']['salary_plans']);
      settings['admin']['ex_bms_mitarbeiter'] = JSON.parse(settings['admin']['ex_bms_mitarbeiter']);

      this.settingsChange.next(settings['default']);
      this.settingsAdminChange.next(settings);
    }
    else if(v=="admin"){
      this.settings['admin'] = settings;
      this.settingsAdminChange.next(this.settings);
    }
    else if(v=="default"){
      this.settings['default'] = settings;
      this.settingsChange.next(settings['default']);
    }
    else if(v=="allJSON"){
      this.settings = settings;
      this.settingsChange.next(settings['default']);
      this.settingsAdminChange.next(this.settings);
    }else{
      this.settingsChange.next(settings['default']);
      this.settingsAdminChange.next(settings);
    }

  }

  getSettings(v){

    if(v=="admin" && this.settings['admin']!==undefined){
      return this.settings['admin'];
    }
    else if(v=="default" && this.settings['default']!==undefined){
      return this.settings['default'];
    }
    else if(v=="all" && this.settings['admin']!==undefined && this.settings['default']!==undefined){
      return this.settings;
    }else{
      return;
    }
  }
}
