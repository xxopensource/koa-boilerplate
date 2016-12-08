// exports.__router__ = false;

export async function todos() {
    this.body = await this.app.services.todo.list();
}
todos.__method__ = 'get';
// todos.__router__ = false;
// todos.__regular__ = '/:id';