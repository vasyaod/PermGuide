
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Планировщик запуска приложения.
 * 
 * Формат параметров task-а:
 * {
 *  	activateFn: function(taskName){},
 *  	dependence: [],
 *  	finished: false,
 *  	started: false
 * }
 * 
 * Небольшой тест:
 * 
 *		PermGuide.Scheduler.addTask("stage3",{
 *		activateFn: function(taskName){ 
 *				alert("stage3"); 
 *				PermGuide.Scheduler.finished("stage3");
 *			},
 *			dependence: ["stage1", "stage2"]
 *		});
 *		PermGuide.Scheduler.addTask("stage2",{
 *			activateFn: function(taskName){ 
 *				alert("stage2");
 *				PermGuide.Scheduler.finished("stage2");
 *			},
 *			dependence: []
 *		});
 *		PermGuide.Scheduler.addTask("stage1",{
 *			activateFn: function(taskName){ 
 *				alert("stage1"); 
 *				PermGuide.Scheduler.finished("stage1");
 *			},
 *			dependence: []
 *		});
 *		PermGuide.Scheduler.start();
 */
PermGuide.Scheduler = {
	
	/**
	 * Список задач которые надо выполнить.
	 */
	tasks: {},
	
	/**
	 * Метод добавляет задачу в планировщик. 
	 */
	addTask: function(taskName, taskParameters) {
		this.tasks[taskName] = taskParameters;
		
		if (taskParameters.activateFn == null)
			taskParameters.activateFn = function(){};

		if (taskParameters.dependence == null)
			taskParameters.dependence = [];
		
		taskParameters.finished = false;
		taskParameters.started = false;
	},
	
	/**
	 * Метод необходимо вызвать, когда задача завершена.
	 */
	finished: function(taskName){
		if (this.tasks[taskName] == null)
			return;
		
		this.tasks[taskName].finished = true;
		
		this.start();
	},
	
	/**
	 * Возвращает true, если задача с указанным именем уже увуполнена. 
	 */
	isFinished: function(taskName){
		if (this.tasks[taskName] == null)
			return false;
		
		return this.tasks[taskName].finished;
	},
	
	/**
	 * Метод возвращает true если все задания указанные в taskNameArray 
	 * выполнены, в противном случаи false.
	 */
	isTasksFinished: function(taskNameArray){
		var res = true;
		$.each(taskNameArray, $.proxy(function(index, taskName) {	
			if (!this.isFinished(taskName))
				res = false;
		}, this));
		return res;
	},
	
	/**
	 * Метод начинает выполнение заданий.
	 */
	start: function(){
		$.each(this.tasks, $.proxy(function(taskName, task) {	
			if(!task.finished && !task.started) {
				if (this.isTasksFinished(task.dependence)) {
					task.started = true;
					if (task.activateFn)
						task.activateFn(taskName);
				}
			}
		
		}, this));
	}
}
