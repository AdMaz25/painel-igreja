const PainelIgrejaApp = {
    config: {
        panelReferenceDate: new Date(), 
        diasDaSemana: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        diasDaSemanaAbrev: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], 
        mesesDoAno: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        startOfWeekMonday: true, 
        principalEventTypes: ['culto', 'jovens', 'familia', 'doutrina', 'especial'],
        eventTypeColors: {
            culto: 'bg-event-culto',
            ebd: 'bg-event-ebd',
            oracao: 'bg-event-oracao',
            jovens: 'bg-event-jovens',
            familia: 'bg-event-familia',
            doutrina: 'bg-event-doutrina',
            informatica: 'bg-event-informatica-neon', 
            especial: 'bg-event-especial', 
            default: 'bg-gray-400'
        },
        eventTypeMainTextColors: { 
            culto: 'text-red-600',
            jovens: 'text-orange-600',
            familia: 'text-purple-600',
            doutrina: 'text-sky-600',
            informatica: 'text-black', 
            especial: 'text-fuchsia-600',
            default: 'text-blue-600'
        },
        maxEventsToShowInCalendarCellMobile: 3, 
    },
    state: {
        currentDisplayDate: null, 
        allProcessedEvents: [], 
        isMobileView: window.innerWidth < 768, 
        currentCalendarViewMode: 'month', 
        currentWeekStartDate: null, 
    },
    data: {
        cleaningScheduleDefinition: [ 
            {
                dayOfWeek: 1, teamName: "Equipe de Reset",
                members: ["Iara", "Sebastião", "Tayna", "Davi"],
                mission: "Realizar a manutenção pós-fim de semana, retirando lixos, organizando o salão e verificando os banheiros."
            },
            {
                dayOfWeek: 2, teamName: "Equipe Pré-Doutrina",
                members: ["Neuriane", "Ana Aguiar"],
                mission: "Fazer a manutenção focada nos banheiros e na organização do salão, preparando para o culto da noite."
            },
            {
                dayOfWeek: 3, teamName: "Equipe de Cuidado e Zelo",
                members: ["Irma Piedade", "João Paulo", "Emanuel"],
                mission: "Cuidar dos detalhes da igreja, como regar plantas, verificar suprimentos e manter a ordem geral."
            },
            {
                dayOfWeek: 4, teamName: "Equipe Pré-Culto da Família",
                members: ["Luiz Valnei", "Micilene", "Isaque Lira"],
                mission: "Garantir que a igreja esteja limpa e acolhedora para o culto, com foco nos banheiros e na organização."
            },
            {
                dayOfWeek: 5, teamName: "Equipe da Limpeza Geral",
                members: ["Rosana", "Patrick", "Nubia Gomes", "Aldaline"],
                mission: "MISSÃO PRINCIPAL: Realizar a limpeza completa da igreja (pisos, pó, banheiros) para o fim de semana."
            },
            {
                dayOfWeek: 6, teamName: "Equipe de Jovens",
                members: ["Marta Nogueira", "Juliana Almeida", "Lucas Almeida", "Kleverton Pantoja"],
                mission: "Realizar a limpeza geral e completa da igreja, garantindo que tudo esteja impecável para os cultos do fim de semana."
            },
            {
                dayOfWeek: 0, teamName: "Guardiões do Templo",
                members: ["Alcidinei", "Deuzarina", "Joana Silva", "Darcom", "Arinelson"],
                mission: "INSPEÇÃO: Fazer uma verificação rápida antes dos cultos. A limpeza geral já foi feita. A missão é garantir a ordem."
            }
        ],
        // ANIVERSARIANTES REMOVIDOS
        // birthdays: [ ... ], 
        churchEventsBase: [ 
            { date: "2025-05-11", time: "19:00", type: "especial", title: "Culto Especial Dia das Mães" },
            { date: "2025-08-10", time: "19:00", type: "especial", title: "Culto Especial Dia dos Pais" },
        ],
        recurringEventRules: [
            { type: "ebd", title: "Escola Bíblica Dominical", dayOfWeek: 0, time: "09:00" },
            { type: "doutrina", title: "Culto de Doutrina", dayOfWeek: 2, time: "19:30" }, 
            { type: "familia", title: "Culto da Família", dayOfWeek: 4, time: "19:30" }, 
            { type: "oracao", title: "Oração Semanal", dayOfWeek: 1, time: "19:00" }, 
            { type: "oracao", title: "Oração", dayOfWeek: 2, time: "18:00" }, 
            { type: "oracao", title: "Oração", dayOfWeek: 3, time: "18:00" }, 
            { type: "oracao", title: "Oração", dayOfWeek: 4, time: "18:00" }, 
            { type: "informatica", title: "Curso de Informática", dayOfWeek: 5, time: "19:00", obs: "Inscrições abertas" }, 
            { type: "jovens", title: "Culto Jovem", dayOfWeek: 6, time: "19:30" }, 
            { type: "culto", title: "Culto de Domingo", dayOfWeek: 0, time: "19:00" } 
        ]
    },

    utils: {
        parseDate: (dateString) => {
            if (!dateString) return null;
            const parts = dateString.split(/[-/]/);
            if (parts.length !== 3) return null;
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; 
            const day = parseInt(parts[2]);
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            return new Date(year, month, day);
        },
        formatDate: (dateObj, format = "DD/MM/AAAA") => {
            if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
            const year = dateObj.getFullYear();
            if (format === "AAAA-MM-DD") return `${year}-${month}-${day}`;
            return `${day}/${month}/${year}`;
        },
        formatTime: (timeString) => { 
             if (!timeString) return "";
             const [hours, minutes] = timeString.split(':');
             return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        },
        addMinutesToTime: (timeString, minutesToAdd) => {
             const [hours, minutes] = timeString.split(':').map(Number);
             const date = new Date(); 
             date.setHours(hours, minutes, 0, 0);
             date.setMinutes(date.getMinutes() + minutesToAdd);
             return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        },
        createElement: (tag, classList = [], attributes = {}, textContent = null, innerHTML = null) => {
            const el = document.createElement(tag);
            const flatClassList = classList.flatMap(c => (typeof c === 'string' ? c.split(' ') : []))
                                           .filter(c => c); 
            if (flatClassList.length > 0) {
                el.classList.add(...flatClassList);
            }
            for (const key in attributes) {
                el.setAttribute(key, attributes[key]);
            }
            if (textContent) el.textContent = textContent;
            if (innerHTML) el.innerHTML = innerHTML;
            return el;
        },
        getNthDayOfMonth: (year, month, dayOfWeek, n) => { 
             const date = new Date(year, month, 1); 
             let occurrences = 0;
             while(date.getDay() !== dayOfWeek && date.getMonth() === month) {
                 date.setDate(date.getDate() + 1);
             }
             if (date.getMonth() !== month) return null; 

             while(date.getMonth() === month) {
                 occurrences++;
                 if (occurrences === n) return new Date(date); 
                 date.setDate(date.getDate() + 7); 
             }
             return null; 
        },
        getLastDayOfWeekInMonth: (year, month, dayOfWeek) => {
            let date = new Date(year, month + 1, 0); 
            while (date.getDay() !== dayOfWeek) {
                date.setDate(date.getDate() - 1);
            }
            return date;
        },
        getStartOfWeek: function(date, startOnMonday) { 
            const d = new Date(date);
            const day = d.getDay(); 
            let diff;
            if (startOnMonday) {
                diff = d.getDate() - (day === 0 ? 6 : day - 1);
            } else {
                diff = d.getDate() - day;
            }
            return new Date(d.setDate(diff));
        }
    },

    renderCleaningSchedule: function() {
        const scheduleContainer = document.getElementById('cleaning-schedule');
        if (!scheduleContainer) { return; }
        scheduleContainer.innerHTML = ''; 
        
        const todayDayOfWeek = this.config.panelReferenceDate.getDay();
        const fragment = document.createDocumentFragment();

        const orderedSchedule = [...this.data.cleaningScheduleDefinition].sort((a, b) => {
            let dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
            let dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
            return dayA - dayB;
        });

        orderedSchedule.forEach(item => {
            const isCurrentDay = item.dayOfWeek === todayDayOfWeek;
            
            const dayDivClasses = ['py-3', 'pl-4', 'border-l-4', 'mb-2', 'rounded-r-lg'];
            if (isCurrentDay) {
                dayDivClasses.push('border-blue-500', 'bg-blue-50', 'shadow-md');
            } else {
                dayDivClasses.push('border-gray-300', 'bg-white');
            }
            const dayDiv = this.utils.createElement('div', dayDivClasses);

            const dayNameText = this.config.diasDaSemana[item.dayOfWeek] + (isCurrentDay ? " (Hoje)" : "");
            const headerP = this.utils.createElement('p', ['font-bold', isCurrentDay ? 'text-blue-700' : 'text-gray-800'], {});
            headerP.innerHTML = `${dayNameText} - <span class="font-semibold">${item.teamName}</span>`;
            
            const membersP = this.utils.createElement('p', ['text-sm', 'text-gray-700', 'mt-1'], {});
            membersP.innerHTML = `<span class="font-semibold">Membros:</span> ${item.members.join(', ')}`;
            
            const missionP = this.utils.createElement('p', ['text-xs', 'text-gray-600', 'mt-1', 'italic'], {});
            missionP.innerHTML = `<span class="font-semibold not-italic">Missão:</span> ${item.mission}`;

            dayDiv.appendChild(headerP);
            dayDiv.appendChild(membersP);
            dayDiv.appendChild(missionP);
            fragment.appendChild(dayDiv);
        });
        
        const jokerDiv = this.utils.createElement('div', ['mt-4', 'p-3', 'bg-green-50', 'border-l-4', 'border-green-500', 'rounded-r-lg']);
        jokerDiv.innerHTML = `<p class="font-bold text-green-800">Coringa Estratégico ♟️</p>
                             <p class="text-sm text-green-700"><b>Pedro Chagas</b> está de prontidão para cobrir qualquer ausência e garantir que nenhuma missão fique descoberta. Contate-o se sua equipe precisar de apoio.</p>`;
        fragment.appendChild(jokerDiv);
        
        scheduleContainer.appendChild(fragment);
    },

    copyToClipboard: function(text, buttonElement, successIcon = '✅', originalIcon = '📋') {
        const originalAriaLabel = buttonElement.dataset.originalLabel || buttonElement.getAttribute('aria-label'); 
        navigator.clipboard.writeText(text)
            .then(() => {
                if (buttonElement) {
                    const originalIconHTML = buttonElement.querySelector('.copy-icon-placeholder') ? buttonElement.querySelector('.copy-icon-placeholder').innerHTML : originalIcon;
                    buttonElement.innerHTML = `<span class="text-green-500 text-xl">${successIcon}</span>`;
                    buttonElement.setAttribute('aria-label', 'Copiado!');
                    setTimeout(() => {
                        buttonElement.innerHTML = `<span class="copy-icon-placeholder text-xl">${originalIconHTML}</span>`; 
                        buttonElement.setAttribute('aria-label', originalAriaLabel);
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Erro ao copiar (navigator.clipboard): ', err);
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed"; 
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    if (buttonElement) {
                         const originalIconHTML = buttonElement.querySelector('.copy-icon-placeholder') ? buttonElement.querySelector('.copy-icon-placeholder').innerHTML : originalIcon;
                        buttonElement.innerHTML = `<span class="text-green-500 text-xl">${successIcon}</span>`;
                        buttonElement.setAttribute('aria-label', 'Copiado!');
                        setTimeout(() => {
                            buttonElement.innerHTML = `<span class="copy-icon-placeholder text-xl">${originalIconHTML}</span>`;
                            buttonElement.setAttribute('aria-label', originalAriaLabel);
                        }, 2000);
                    }
                } catch (execErr) {
                    console.error('Erro ao copiar com execCommand: ', execErr);
                    alert('Erro ao copiar. Por favor, copie manualmente.');
                }
                document.body.removeChild(textArea);
            });
    },

    copyCleaningScheduleToClipboard: function() {
        let textToCopy = "Escala de Limpeza Semanal:\n\n";
        const orderedSchedule = [...this.data.cleaningScheduleDefinition].sort((a, b) => {
            let dayA = a.dayOfWeek; let dayB = b.dayOfWeek;
            if (this.config.startOfWeekMonday) { dayA = (dayA === 0) ? 7 : dayA; dayB = (dayB === 0) ? 7 : dayB; }
            return dayA - dayB;
        });

        orderedSchedule.forEach(item => {
            const dayName = this.config.diasDaSemana[item.dayOfWeek];
            const responsibleText = Array.isArray(item.members) ? item.members.join(', ') : item.members;
            textToCopy += `${dayName} (${item.teamName}): ${responsibleText}\nMissão: ${item.mission}\n\n`;
        });
        const buttonElement = document.getElementById('copy-cleaning-schedule');
        this.copyToClipboard(textToCopy, buttonElement);
    },
    
    renderCalendar: function() {
        const calendarDaysContainer = document.getElementById('calendar-days');
        const calendarMonthYearEl = document.getElementById('calendar-month-year');
        const calendarHeaderDaysEl = document.getElementById('calendar-header-days');
        const prevButton = document.getElementById('prev-month');
        const nextButton = document.getElementById('next-month');

        if (!calendarDaysContainer || !calendarMonthYearEl || !calendarHeaderDaysEl || !prevButton || !nextButton) {
            console.error("Um ou mais elementos do calendário não foram encontrados.");
            return;
        }
        
        this.state.isMobileView = window.innerWidth < 768; 
        const isMobile = this.state.isMobileView;
        
        if (isMobile) {
            this.state.currentCalendarViewMode = 'week';
            if (!this.state.currentWeekStartDate) { 
                this.state.currentWeekStartDate = this.utils.getStartOfWeek(new Date(this.config.panelReferenceDate), this.config.startOfWeekMonday);
            }
        } else {
            this.state.currentCalendarViewMode = 'month';
            if (!this.state.currentDisplayDate || this.state.currentCalendarViewMode === 'week') { 
                this.state.currentDisplayDate = new Date(this.config.panelReferenceDate.getFullYear(), this.config.panelReferenceDate.getMonth(), 1);
            }
        }

        calendarDaysContainer.innerHTML = ''; 
        const fragment = document.createDocumentFragment();
        
        if (isMobile) {
            calendarHeaderDaysEl.classList.add('hidden'); 
            calendarDaysContainer.classList.remove('md:grid-cols-7', 'md:gap-1');
            calendarDaysContainer.classList.add('grid-cols-1', 'gap-3'); 

            const weekStart = new Date(this.state.currentWeekStartDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            let weekLabel = `Semana de ${this.utils.formatDate(weekStart)} a ${this.utils.formatDate(weekEnd)}`;
            
            const today = new Date(this.config.panelReferenceDate);
            today.setHours(0,0,0,0);
            if (today >= weekStart && today <= weekEnd) {
                weekLabel += " (Semana Atual)";
            }
            calendarMonthYearEl.textContent = weekLabel;
            prevButton.setAttribute('aria-label', 'Semana anterior');
            nextButton.setAttribute('aria-label', 'Próxima semana');

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(weekStart);
                currentDate.setDate(weekStart.getDate() + i);
                const day = currentDate.getDate();
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const dayCellBaseClasses = ['day-cell', 'p-3', 'rounded-lg', 'border', 'flex', 'flex-col', 'transition-colors', 'relative', 'bg-white', 'border-gray-300', 'space-y-1.5', 'shadow'];
                let ariaLabelDay = `${this.config.diasDaSemana[currentDate.getDay()]}, ${day} de ${this.config.mesesDoAno[month]}`;
                const isToday = currentDate.toDateString() === this.config.panelReferenceDate.toDateString();
                if (isToday) { 
                    dayCellBaseClasses.push('bg-blue-50', 'border-blue-400', 'ring-2', 'ring-blue-500'); 
                }
                
                const dayEl = this.utils.createElement('div', dayCellBaseClasses); 
                dayEl.setAttribute('role', 'listitem');
                dayEl.setAttribute('tabindex', '0'); 

                const dayHeaderContainer = this.utils.createElement('div', ['flex', 'justify-between', 'w-full', 'items-center', 'mb-2']);
                const dayNumberClasses = ['font-semibold', 'p-0.5', 'leading-none', 'w-7', 'h-7', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-sm'];
                if(isToday) {
                    dayNumberClasses.push('bg-blue-500', 'text-white');
                } else {
                    dayNumberClasses.push('text-gray-700');
                }
                dayHeaderContainer.appendChild(this.utils.createElement('span', ['text-base', 'font-medium', isToday ? 'text-blue-700' : 'text-gray-700'], {}, this.config.diasDaSemana[currentDate.getDay()]));
                dayHeaderContainer.appendChild(this.utils.createElement('span', dayNumberClasses, {}, day.toString()));
                dayEl.appendChild(dayHeaderContainer);

                const eventsDisplayContainer = this.utils.createElement('div', ['w-full', 'space-y-1.5', 'flex-grow']);
                let eventInfosForAria = [];
                
                this.state.allProcessedEvents
                    .filter(e => e.date === this.utils.formatDate(currentDate, "AAAA-MM-DD"))
                    .forEach(event => {
                        const bgColorClass = this.config.eventTypeColors[event.type] || this.config.eventTypeColors.default;
                        let textColorClass = 'text-white';
                        if (event.type === 'informatica' && bgColorClass === 'bg-event-informatica-neon') {
                            textColorClass = 'text-black';
                        }
                        const eventDiv = this.utils.createElement('div', 
                            ['calendar-event-text-mobile', bgColorClass, textColorClass, 'flex', 'items-center'], 
                            { title: `${event.title} às ${this.utils.formatTime(event.time)}` }
                        );
                        eventDiv.innerHTML = `<span class="truncate">${this.utils.formatTime(event.time)} - ${event.title}</span>`;
                        eventsDisplayContainer.appendChild(eventDiv);
                        eventInfosForAria.push(`${event.title} às ${this.utils.formatTime(event.time)}`);
                    });
                
                dayEl.appendChild(eventsDisplayContainer);
                if(eventInfosForAria.length > 0) { 
                    ariaLabelDay += `. Eventos: ${eventInfosForAria.join("; ")}`; 
                } else {
                     eventsDisplayContainer.appendChild(this.utils.createElement('p', ['text-xs', 'text-gray-400', 'italic'], {}, 'Nenhum evento agendado.'));
                    ariaLabelDay += ". Nenhum evento agendado.";
                }
                dayEl.setAttribute('aria-label', ariaLabelDay); 
                fragment.appendChild(dayEl);
            }

            } else { // Renderização Mensal (Desktop)
                calendarHeaderDaysEl.classList.remove('hidden');
                calendarHeaderDaysEl.classList.add('md:grid');
                calendarDaysContainer.classList.remove('grid-cols-1', 'gap-3'); 
                calendarDaysContainer.classList.add('md:grid-cols-7', 'md:gap-1');
                calendarMonthYearEl.textContent = `${this.config.mesesDoAno[this.state.currentDisplayDate.getMonth()]} ${this.state.currentDisplayDate.getFullYear()}`;
                prevButton.setAttribute('aria-label', 'Mês anterior');
                nextButton.setAttribute('aria-label', 'Próximo mês');


                const year = this.state.currentDisplayDate.getFullYear(); 
                const month = this.state.currentDisplayDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0);
                const daysInMonth = lastDayOfMonth.getDate();
                let startDayOfWeekIndex = firstDayOfMonth.getDay(); 
                let displayStartOffset = startDayOfWeekIndex; 
                const todayRef = new Date(this.config.panelReferenceDate); todayRef.setHours(0,0,0,0);
                const prevMonthLastDay = new Date(year, month, 0).getDate();

                for (let i = 0; i < displayStartOffset; i++) {
                    const day = prevMonthLastDay - displayStartOffset + 1 + i;
                    const dayEl = this.utils.createElement('div', ['day-cell', 'min-h-[70px]', 'sm:min-h-[90px]', 'md:min-h-[100px]', 'p-1', 'rounded-md', 'bg-gray-50', 'border', 'border-gray-200', 'flex', 'flex-col', 'items-start', 'text-xs', 'opacity-75']);
                    dayEl.setAttribute('role', 'gridcell');
                    dayEl.setAttribute('aria-label', `${day} (mês anterior)`);
                    dayEl.appendChild(this.utils.createElement('span', ['font-semibold', 'text-gray-400', 'self-end', 'p-1', 'leading-none'], {}, day.toString()));
                    fragment.appendChild(dayEl);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(year, month, day);
                    const dayClasses = ['day-cell', 'min-h-[70px]', 'sm:min-h-[90px]', 'md:min-h-[100px]', 'p-1', 'rounded-md', 'border', 'flex', 'flex-col', 'items-start', 'text-xs', 'hover:bg-gray-50', 'transition-colors', 'relative'];
                    let ariaLabelDay = `${day} de ${this.config.mesesDoAno[month]}, ${this.config.diasDaSemana[currentDate.getDay()]}`;
                    const isToday = currentDate.toDateString() === todayRef.toDateString();
                    if (isToday) { dayClasses.push('bg-blue-100', 'border-blue-300'); } else { dayClasses.push('bg-white', 'border-gray-200'); }
                    
                    const dayEl = this.utils.createElement('div', dayClasses); 
                    dayEl.setAttribute('role', 'gridcell');
                    dayEl.setAttribute('tabindex', '0'); 

                    const dayNumberClasses = ['font-semibold', 'self-end', 'p-0.5', 'leading-none', 'w-6', 'h-6', 'flex', 'items-center', 'justify-center', 'rounded-full', 'mb-0.5'];
                    if (isToday) { dayNumberClasses.push('bg-blue-500', 'text-white'); } else { dayNumberClasses.push('text-gray-700'); }
                    dayEl.appendChild(this.utils.createElement('span', dayNumberClasses, {}, day.toString()));

                    const eventsDisplayContainer = this.utils.createElement('div', ['w-full', 'mt-0.5', 'flex', 'flex-row', 'flex-wrap', 'items-start', 'gap-0.5', 'flex-grow', 'overflow-hidden']);
                    let eventInfosForAria = [];
                    const eventsOnThisDay = this.state.allProcessedEvents.filter(e => e.date === this.utils.formatDate(currentDate, "AAAA-MM-DD"));
                    
                    if (eventsOnThisDay.length > 0) {
                        const maxDots = this.config.maxEventsToShowInCalendarCellMobile;
                        for (let i = 0; i < Math.min(eventsOnThisDay.length, maxDots); i++) {
                            const event = eventsOnThisDay[i];
                            const bgColorClass = this.config.eventTypeColors[event.type] || this.config.eventTypeColors.default;
                            const eventDot = this.utils.createElement('div', 
                                ['calendar-event-dot', bgColorClass], 
                                { title: `${event.title} às ${this.utils.formatTime(event.time)}` }
                            );
                            eventsDisplayContainer.appendChild(eventDot);
                        }
                        if (eventsOnThisDay.length > maxDots) {
                            eventsDisplayContainer.appendChild(
                                this.utils.createElement('span', ['text-gray-500', 'text-[0.6rem]', 'ml-0.5', 'mt-1'], {}, `+${eventsOnThisDay.length - maxDots}`)
                            );
                        }
                        eventsOnThisDay.forEach(event => eventInfosForAria.push(`${event.title} às ${this.utils.formatTime(event.time)}`));
                    }
                    
                    dayEl.appendChild(eventsDisplayContainer);
                    if(eventInfosForAria.length > 0) { ariaLabelDay += `. Eventos: ${eventInfosForAria.join("; ")}`; } else { ariaLabelDay += ". Nenhum evento.";}
                    dayEl.setAttribute('aria-label', ariaLabelDay); 
                    fragment.appendChild(dayEl);
                }

                const totalCells = displayStartOffset + daysInMonth;
                const remainingCells = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
                for (let i = 1; i <= remainingCells; i++) {
                    const dayEl = this.utils.createElement('div', ['day-cell', 'min-h-[70px]', 'sm:min-h-[90px]', 'md:min-h-[100px]', 'p-1', 'rounded-md', 'bg-gray-50', 'border', 'border-gray-200', 'flex', 'flex-col', 'items-start', 'text-xs', 'opacity-75']);
                    dayEl.setAttribute('role', 'gridcell');
                    dayEl.setAttribute('aria-label', `${i} (próximo mês)`);
                    dayEl.appendChild(this.utils.createElement('span', ['font-semibold', 'text-gray-400', 'self-end', 'p-1', 'leading-none'], {}, i.toString()));
                    fragment.appendChild(dayEl);
                }
            }
            calendarDaysContainer.appendChild(fragment);
        },

        setupEventListeners: function() {
            const prevButton = document.getElementById('prev-month');
            const nextButton = document.getElementById('next-month');
            const downloadBirthdaysBtn = document.getElementById('download-birthdays');
            const copyCleaningScheduleBtn = document.getElementById('copy-cleaning-schedule');
            const copyBirthdaysSummaryBtn = document.getElementById('copy-birthdays-summary');

            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    if (this.state.currentCalendarViewMode === 'week') {
                        this.state.currentWeekStartDate.setDate(this.state.currentWeekStartDate.getDate() - 7);
                    } else { 
                        this.state.currentDisplayDate.setMonth(this.state.currentDisplayDate.getMonth() - 1);
                    }
                    this.renderCalendar();
                });
            }
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                     if (this.state.currentCalendarViewMode === 'week') {
                        this.state.currentWeekStartDate.setDate(this.state.currentWeekStartDate.getDate() + 7);
                    } else { 
                        this.state.currentDisplayDate.setMonth(this.state.currentDisplayDate.getMonth() + 1);
                    }
                    this.renderCalendar();
                });
            }
            
            if (downloadBirthdaysBtn) downloadBirthdaysBtn.addEventListener('click', () => this.downloadBirthdaysSummary());
            if (copyCleaningScheduleBtn) copyCleaningScheduleBtn.addEventListener('click', () => this.copyCleaningScheduleToClipboard());
            if (copyBirthdaysSummaryBtn) copyBirthdaysSummaryBtn.addEventListener('click', () => this.copyBirthdaysSummaryToClipboard());
            
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const newIsMobileView = window.innerWidth < 768;
                    if (newIsMobileView !== this.state.isMobileView) { 
                        this.state.isMobileView = newIsMobileView;
                        if(this.state.isMobileView){ 
                             this.state.currentWeekStartDate = this.utils.getStartOfWeek(new Date(this.state.currentDisplayDate), this.config.startOfWeekMonday); 
                        } else { 
                             if (this.state.currentWeekStartDate) {
                                this.state.currentDisplayDate = new Date(this.state.currentWeekStartDate.getFullYear(), this.state.currentWeekStartDate.getMonth(), 1);
                             } else { 
                                this.state.currentDisplayDate = new Date(this.config.panelReferenceDate.getFullYear(), this.config.panelReferenceDate.getMonth(), 1);
                             }
                             this.state.currentWeekStartDate = null; 
                        }
                        this.renderCalendar(); 
                    }
                }, 250); 
            });
        },

        init: function() {
            console.log("Painel da Igreja inicializando...");
            this.state.isMobileView = window.innerWidth < 768; 

            if (this.state.isMobileView) {
                this.state.currentCalendarViewMode = 'week';
                this.state.currentWeekStartDate = this.utils.getStartOfWeek(new Date(this.config.panelReferenceDate), this.config.startOfWeekMonday);
                this.state.currentDisplayDate = new Date(this.state.currentWeekStartDate); 
            } else {
                this.state.currentCalendarViewMode = 'month';
                this.state.currentDisplayDate = new Date(this.config.panelReferenceDate.getFullYear(), this.config.panelReferenceDate.getMonth(), 1);
            }
            
            let processedEvents = [...this.data.churchEventsBase]; 
            const refDate = this.config.panelReferenceDate;

            // Aniversários de teste não mais necessários aqui, pois a seção foi removida
            
            const startRecurrenceDate = new Date(refDate.getFullYear(), refDate.getMonth() -1, 1); 
            const endRecurrenceDate = new Date(refDate.getFullYear(), refDate.getMonth() + 3, 0); 

            this.data.recurringEventRules.forEach(rule => {
                if (rule.beforeEventType) return; 

                for (let d = new Date(startRecurrenceDate); d <= endRecurrenceDate; d.setDate(d.getDate() + 1)) {
                    if (d.getDay() === rule.dayOfWeek) {
                        let shouldAddEvent = true;
                        if (rule.occurrence) { 
                            shouldAddEvent = false;
                            const dayInMonth = d.getDate();
                            const weekOfMonth = Math.ceil(dayInMonth / 7);
                            const occurrenceMap = { "first": 1, "second": 2, "third": 3, "fourth": 4 };
                            
                            if (rule.occurrence.includes("last")) {
                                let testLast = new Date(d);
                                testLast.setDate(testLast.getDate() + 7);
                                if(testLast.getMonth() !== d.getMonth() && d.getDay() === rule.dayOfWeek) shouldAddEvent = true;
                            }
                            for (const occ of rule.occurrence) {
                                if (occurrenceMap[occ] && weekOfMonth === occurrenceMap[occ]) {
                                    shouldAddEvent = true;
                                    break;
                                }
                            }
                        }

                        if (shouldAddEvent) {
                            const newEvent = {
                                date: this.utils.formatDate(d, "AAAA-MM-DD"),
                                time: rule.time,
                                type: rule.type,
                                title: rule.title,
                                obs: rule.obs || null,
                                local: rule.local || null,
                            };
                            processedEvents.push(newEvent);
                        }
                    }
                }
            });

            for (let d = new Date(startRecurrenceDate); d <= endRecurrenceDate; d.setDate(d.getDate() + 1)) {
                if (d.getDay() === 0) { 
                    const formattedDate = this.utils.formatDate(d, "AAAA-MM-DD");
                    const firstSunday = this.utils.getNthDayOfMonth(d.getFullYear(), d.getMonth(), 0, 1);
                    const secondSunday = this.utils.getNthDayOfMonth(d.getFullYear(), d.getMonth(), 0, 2);
                    const lastSunday = this.utils.getLastDayOfWeekInMonth(d.getFullYear(), d.getMonth(), 0);

                    let existingEventOnThisSunday = processedEvents.find(e => e.date === formattedDate && (e.type === 'culto' || e.type === 'especial'));
                    
                    if (firstSunday && d.getTime() === firstSunday.getTime() && (!existingEventOnThisSunday || existingEventOnThisSunday.title !== "Culto de Santa Ceia")) {
                        processedEvents = processedEvents.filter(e => !(e.date === formattedDate && e.title === "Culto de Domingo")); 
                        processedEvents.push({ date: formattedDate, time: "19:00", type: "especial", title: "Culto de Santa Ceia" }); 
                    } else if (secondSunday && d.getTime() === secondSunday.getTime() && (!existingEventOnThisSunday || existingEventOnThisSunday.title !== "Culto de Missão")) {
                        processedEvents = processedEvents.filter(e => !(e.date === formattedDate && e.title === "Culto de Domingo"));
                        processedEvents.push({ date: formattedDate, time: "19:00", type: "culto", title: "Culto de Missão" }); 
                    } else if (lastSunday && d.getTime() === lastSunday.getTime() && (!existingEventOnThisSunday || existingEventOnThisSunday.title !== "Culto de Ação Social")) {
                        processedEvents = processedEvents.filter(e => !(e.date === formattedDate && e.title === "Culto de Domingo"));
                        processedEvents.push({ date: formattedDate, time: "19:00", type: "culto", title: "Culto de Ação Social" }); 
                    } else if (!existingEventOnThisSunday) { 
                         const ruleDomingo = this.data.recurringEventRules.find(r => r.title === "Culto de Domingo" && r.dayOfWeek === 0); 
                         if (ruleDomingo) { 
                            processedEvents.push({
                                date: formattedDate, time: ruleDomingo.time, type: ruleDomingo.type, title: ruleDomingo.title,
                            });
                         }
                    }
                }
            }


            const preEventRules = this.data.recurringEventRules.filter(r => r.beforeEventType);
            if (preEventRules.length > 0) {
                const eventsToHavePreEvent = [...processedEvents]; 
                preEventRules.forEach(preRule => {
                    const targetEventTypes = Array.isArray(preRule.beforeEventType) ? preRule.beforeEventType : [preRule.beforeEventType];
                    eventsToHavePreEvent.forEach(mainEvent => {
                        if (targetEventTypes.includes(mainEvent.type)) {
                            processedEvents.push({
                                date: mainEvent.date,
                                time: this.utils.addMinutesToTime(mainEvent.time, preRule.timeOffsetMinutes),
                                type: preRule.type,
                                title: preRule.title,
                                durationMinutes: preRule.durationMinutes
                            });
                        }
                    });
                });
            }

            const uniqueEvents = new Map();
            processedEvents.forEach(event => {
                const key = `${event.date}-${event.time}-${event.title}`; 
                uniqueEvents.set(key, event); 
            });
            this.state.allProcessedEvents = Array.from(uniqueEvents.values())
                                               .sort((a,b) => {
                                                    const dateA = this.utils.parseDate(`${a.date}T${a.time || '00:00'}`);
                                                    const dateB = this.utils.parseDate(`${b.date}T${b.time || '00:00'}`);
                                                    if (!dateA && !dateB) return 0;
                                                    if (!dateA) return 1;
                                                    if (!dateB) return -1;
                                                    return dateA - dateB;
                                                });


            const requiredContainers = ['cleaning-schedule', 'calendar-days', 'calendar-month-year'];
            let allContainersFound = true;
            requiredContainers.forEach(id => {
                const el = document.getElementById(id);
                if (!el) { 
                    console.error(`Elemento container #${id} não encontrado.`);
                    allContainersFound = false;
                }
            });

            if (allContainersFound) {
                this.renderCleaningSchedule();
                this.renderCalendar(); 
                this.setupEventListeners();
                console.log("Painel da Igreja renderizado com sucesso.");
            } else {
                console.error("Renderização abortada devido à falta de containers HTML essenciais.");
                document.body.innerHTML = '<p class="text-center text-red-500 font-bold mt-10">Erro crítico: A estrutura da página está incompleta. Por favor, contate o suporte.</p>';
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        PainelIgrejaApp.init();
    });
    </script>

</body>
</html>
