import { Component, OnInit } from '@angular/core';
import DATA from './data';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public loading: boolean;
    public entities: any[] = [];
    public tableConfig/*: TableConfig */= {
        pagination: {
            pageSizes: [4, 10, 20],
            pageSize: 4
        },
        menuButtonColumn: 1,
        columns: [
            {
                name: '#',
                fieldName: 'id',
                type: 'BaseEntry',
            },
            {
                name: 'Создана',
                fieldName: 'date',
                type: 'BaseEntry',
            },
            {
                name: 'Клиент',
                fieldName: 'client',
                type: 'BaseEntry',
            },
            {
                name: 'Услуга',
                fieldName: 'service',
                type: 'BaseEntry',
            },
            {
                name: 'Стоимость',
                fieldName: 'cost',
                type: 'BaseEntry',
            },
            {
                name: 'Блокировка',
                fieldName: 'lock',
                type: 'BoolEntry',
            },
            {
                name: 'Состояние',
                fieldName: 'state',
                type: 'BaseEntry',
            },
        ],
        actions: [
            {
                name: 'Добавить',
                icon: 'add',
                function: (x: number[]) => { console.log('Добавить', x); },
                disabled: () => false,
                hideInMenu: true
            },
            {
                name: 'Изменить',
                icon: 'mode_edit',
                function: (x: number[]) => { console.log('Изменить', x); },
                disabled: (ids: number[]) => ids.length !== 1,
                primary: true
            },
            {
                name: 'Подтвердить',
                icon: 'done',
                function: (x: any) => { console.log('Подтвердить', x); },
                disabled: (ids: number[]) => ids.length === 0,
            },
            {
                name: 'Отклонить',
                icon: 'cancel',
                function: (x: any) => { console.log('Отклонить', x); },
                disabled: (ids: number[]) => ids.length === 0,
            },
        ],
        additionalActions: [
            {
                name: 'Исполнить',
                function: (x: any) => { console.log('Исполнить', x); }
            },
            {
                name: 'Отрезать',
                function: (x: any) => { console.log('Отрезать', x); },
                hideInMenu: true
            }
        ],
    };

    ngOnInit(): void {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
            this.entities = DATA;
        }, 5000);
    }
}
